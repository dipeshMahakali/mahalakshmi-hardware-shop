import json
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    AIProcessingJob, AuditLog, Customer, Estimate, EstimateItem, InventoryItem,
    InventoryMovement, Invoice, InvoiceItem, LedgerTransaction, LoyaltyAccount,
    LoyaltyReward, LoyaltyTransaction, Order, OrderItem, Payment, Product,
    PurchaseOrder, PurchaseOrderItem, Supplier
)
from app.schemas import (
    EstimateCreate, InvoiceCreate, OrderCreate, PaymentCreate,
    PurchaseOrderCreate, PurchaseReceiveRequest, StockAdjustmentCreate
)


MONEY = Decimal("0.01")


def money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)


def next_document_number(db: Session, prefix: str, model_cls, col) -> str:
    count = db.scalar(select(func.count(col))) or 0
    return f"{prefix}-{count + 1:06d}"


# --- BILLING & INVOICE SERVICES ---

def create_invoice(db: Session, payload: InvoiceCreate) -> Invoice:
    product_ids = [item.product_id for item in payload.items]
    products = {product.id: product for product in db.scalars(select(Product).where(Product.id.in_(product_ids)))}
    if len(products) != len(set(product_ids)):
        raise ValueError("One or more products were not found")

    subtotal = Decimal("0")
    tax_before_discount = Decimal("0")
    invoice_items: list[InvoiceItem] = []
    for item in payload.items:
        product = products[item.product_id]
        unit_price = money(item.unit_price or product.selling_price)
        line_total = money(unit_price * item.quantity)
        subtotal += line_total
        tax_before_discount += line_total * product.tax_rate / Decimal("100")
        invoice_items.append(InvoiceItem(
            product_id=product.id,
            product_name=product.name,
            unit=product.unit,
            quantity=item.quantity,
            unit_price=unit_price,
            tax_rate=product.tax_rate,
            line_total=line_total
        ))

    subtotal = money(subtotal)
    discount = money(payload.discount)
    taxable_amount = max(Decimal("0"), subtotal - discount)
    tax = money(taxable_amount * tax_before_discount / subtotal) if subtotal else Decimal("0")
    total = money(taxable_amount + tax)

    invoice_num = next_document_number(db, "INV", Invoice, Invoice.id)
    invoice = Invoice(
        invoice_number=invoice_num,
        customer_id=payload.customer_id,
        project_id=payload.project_id,
        subtotal=subtotal,
        discount=discount,
        tax=tax,
        total=total,
        paid=Decimal("0"),
        items=invoice_items
    )
    db.add(invoice)
    db.flush()

    # Create immutable digital Khata transaction
    db.add(LedgerTransaction(
        customer_id=payload.customer_id,
        invoice_id=invoice.id,
        transaction_type="CREDIT_SALE",
        debit=total,
        credit=Decimal("0"),
        description=f"Invoice {invoice.invoice_number}"
    ))

    # Calculate loyalty points (1 point per ₹100 spent)
    points_earned = int(total // 100)
    if points_earned > 0:
        award_loyalty_points(db, payload.customer_id, points_earned, f"Points for Invoice {invoice.invoice_number}")

    # Deduct stock
    for item in payload.items:
        adjust_stock(db, StockAdjustmentCreate(
            product_id=item.product_id,
            quantity_delta=-item.quantity,
            movement_type="SALE",
            notes=f"Invoice {invoice.invoice_number}"
        ))

    return invoice


def record_payment(db: Session, payload: PaymentCreate) -> Payment:
    invoice = db.get(Invoice, payload.invoice_id)
    if invoice is None:
        raise ValueError("Invoice not found")
    outstanding = invoice.total - invoice.paid
    if payload.amount > outstanding:
        raise ValueError("Payment cannot exceed invoice outstanding")

    payment = Payment(
        invoice_id=invoice.id,
        customer_id=invoice.customer_id,
        amount=money(payload.amount),
        method=payload.method,
        reference=payload.reference,
        notes=payload.notes
    )
    invoice.paid = money(invoice.paid + payload.amount)
    invoice.status = "PAID" if invoice.paid == invoice.total else "PARTIALLY_PAID"
    db.add(payment)
    db.flush()

    # Record credit in digital Khata ledger
    db.add(LedgerTransaction(
        customer_id=invoice.customer_id,
        invoice_id=invoice.id,
        payment_id=payment.id,
        transaction_type="PAYMENT",
        debit=Decimal("0"),
        credit=money(payload.amount),
        description=f"Payment for {invoice.invoice_number} ({payload.method})"
    ))
    return payment


# --- ESTIMATES & ORDERS ---

def create_estimate(db: Session, payload: EstimateCreate) -> Estimate:
    product_ids = [item.product_id for item in payload.items]
    products = {p.id: p for p in db.scalars(select(Product).where(Product.id.in_(product_ids)))}

    subtotal = Decimal("0")
    items = []
    for item in payload.items:
        prod = products[item.product_id]
        price = money(item.unit_price or prod.selling_price)
        line_tot = money(price * item.quantity)
        subtotal += line_tot
        items.append(EstimateItem(
            product_id=prod.id,
            product_name=prod.name,
            unit=prod.unit,
            quantity=item.quantity,
            unit_price=price,
            tax_rate=prod.tax_rate,
            line_total=line_tot
        ))

    subtotal = money(subtotal)
    discount = money(payload.discount)
    taxable = max(Decimal("0"), subtotal - discount)
    tax = money(taxable * Decimal("0.18"))  # Average estimated tax
    total = money(taxable + tax)

    est_num = next_document_number(db, "EST", Estimate, Estimate.id)
    estimate = Estimate(
        estimate_number=est_num,
        customer_id=payload.customer_id,
        project_id=payload.project_id,
        subtotal=subtotal,
        discount=discount,
        tax=tax,
        total=total,
        status="DRAFT",
        items=items
    )
    db.add(estimate)
    db.flush()
    return estimate


def create_order(db: Session, payload: OrderCreate) -> Order:
    product_ids = [item.product_id for item in payload.items]
    products = {p.id: p for p in db.scalars(select(Product).where(Product.id.in_(product_ids)))}

    subtotal = Decimal("0")
    items = []
    for item in payload.items:
        prod = products[item.product_id]
        line_tot = money(prod.selling_price * item.quantity)
        subtotal += line_tot
        items.append(OrderItem(
            product_id=prod.id,
            product_name=prod.name,
            unit=prod.unit,
            quantity=item.quantity,
            unit_price=prod.selling_price,
            line_total=line_tot
        ))

    subtotal = money(subtotal)
    ord_num = next_document_number(db, "ORD", Order, Order.id)
    order = Order(
        order_number=ord_num,
        customer_id=payload.customer_id,
        project_id=payload.project_id,
        source=payload.source,
        status="CONFIRMED",
        subtotal=subtotal,
        tax=Decimal("0"),
        total=subtotal,
        notes=payload.notes,
        items=items
    )
    db.add(order)
    db.flush()

    # Reserve stock safely
    for item in payload.items:
        reserve_stock(db, item.product_id, item.quantity, order.id)

    return order


# --- INVENTORY MANAGEMENT ---

def get_or_create_inventory(db: Session, product_id: str) -> InventoryItem:
    inv = db.scalar(select(InventoryItem).where(InventoryItem.product_id == product_id))
    if inv is None:
        inv = InventoryItem(product_id=product_id, on_hand=Decimal("50.00"), reserved=Decimal("0.00"), reorder_level=Decimal("10.00"), reorder_quantity=Decimal("50.00"))
        db.add(inv)
        db.flush()
    return inv


def adjust_stock(db: Session, payload: StockAdjustmentCreate) -> InventoryItem:
    inv = get_or_create_inventory(db, payload.product_id)
    inv.on_hand += payload.quantity_delta
    db.add(InventoryMovement(
        inventory_id=inv.id,
        movement_type=payload.movement_type,
        quantity=payload.quantity_delta,
        notes=payload.notes
    ))
    return inv


def reserve_stock(db: Session, product_id: str, quantity: Decimal, reference_id: str):
    inv = get_or_create_inventory(db, product_id)
    inv.reserved += quantity
    db.add(InventoryMovement(
        inventory_id=inv.id,
        movement_type="RESERVATION",
        quantity=quantity,
        reference_id=reference_id,
        notes="Stock reserved for order"
    ))


# --- SUPPLIERS & PURCHASE ORDERS ---

def create_purchase_order(db: Session, payload: PurchaseOrderCreate) -> PurchaseOrder:
    product_ids = [item.product_id for item in payload.items]
    products = {p.id: p for p in db.scalars(select(Product).where(Product.id.in_(product_ids)))}

    items = []
    total = Decimal("0")
    for item in payload.items:
        prod = products[item.product_id]
        line_tot = money(item.unit_cost * item.quantity_ordered)
        total += line_tot
        items.append(PurchaseOrderItem(
            product_id=prod.id,
            product_name=prod.name,
            quantity_ordered=item.quantity_ordered,
            quantity_received=Decimal("0"),
            unit_cost=item.unit_cost,
            line_total=line_tot
        ))

    po_num = next_document_number(db, "PO", PurchaseOrder, PurchaseOrder.id)
    po = PurchaseOrder(
        po_number=po_num,
        supplier_id=payload.supplier_id,
        status="SENT",
        total=total,
        notes=payload.notes,
        items=items
    )
    db.add(po)
    db.flush()
    return po


def receive_purchase_order(db: Session, payload: PurchaseReceiveRequest) -> PurchaseOrder:
    po = db.get(PurchaseOrder, payload.po_id)
    if not po:
        raise ValueError("Purchase Order not found")

    items_map = {item.id: item for item in po.items}
    all_received = True

    for r in payload.items:
        po_item = items_map.get(r.item_id)
        if po_item:
            po_item.quantity_received += r.quantity_received
            if po_item.quantity_received < po_item.quantity_ordered:
                all_received = False
            # Update stock on hand
            adjust_stock(db, StockAdjustmentCreate(
                product_id=po_item.product_id,
                quantity_delta=r.quantity_received,
                movement_type="PURCHASE",
                notes=f"PO Received {po.po_number}"
            ))

    po.status = "RECEIVED" if all_received else "PARTIALLY_RECEIVED"
    return po


# --- LOYALTY ENGINE ---

def award_loyalty_points(db: Session, customer_id: str, points: int, description: str):
    acc = db.scalar(select(LoyaltyAccount).where(LoyaltyAccount.customer_id == customer_id))
    if not acc:
        acc = LoyaltyAccount(customer_id=customer_id, points=0, total_earned=0, tier="BRONZE")
        db.add(acc)
        db.flush()

    acc.points += points
    acc.total_earned += points

    # Tier upgrades
    if acc.total_earned >= 75000:
        acc.tier = "GOLD"
    elif acc.total_earned >= 25000:
        acc.tier = "SILVER"

    db.add(LoyaltyTransaction(
        account_id=acc.id,
        points=points,
        description=description
    ))


# --- AI JOB APPROVAL ---

def approve_ai_job(db: Session, job_id: str, action: str, edited_items: list[dict] | None = None) -> AIProcessingJob:
    job = db.get(AIProcessingJob, job_id)
    if not job:
        raise ValueError("AI Job not found")

    if action == "REJECT":
        job.status = "FAILED"
        if job.draft_order_id:
            order = db.get(Order, job.draft_order_id)
            if order:
                order.status = "CANCELLED"
        return job

    # If APPROVED
    job.status = "COMPLETED"
    job.completed_at = datetime.now()

    if job.draft_order_id:
        order = db.get(Order, job.draft_order_id)
        if order:
            order.status = "APPROVED"
            # If items edited during approval, update order
            if edited_items:
                order.items.clear()
                subtotal = Decimal("0")
                for item in edited_items:
                    prod = db.get(Product, item["product_id"])
                    if prod:
                        qty = Decimal(str(item["quantity"]))
                        line_tot = money(prod.selling_price * qty)
                        subtotal += line_tot
                        order.items.append(OrderItem(
                            product_id=prod.id,
                            product_name=prod.name,
                            unit=prod.unit,
                            quantity=qty,
                            unit_price=prod.selling_price,
                            line_total=line_tot
                        ))
                order.subtotal = subtotal
                order.total = subtotal
            # Reserve stock for approved order
            for item in order.items:
                reserve_stock(db, item.product_id, item.quantity, order.id)

    return job
