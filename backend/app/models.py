from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(30))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="STAFF")  # OWNER, STAFF, CARPENTER, CUSTOMER, SUPPLIER
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    customer_profile: Mapped["Customer | None"] = relationship(back_populates="user", uselist=False)


class Customer(Base):
    __tablename__ = "customers"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    phone: Mapped[str] = mapped_column(String(30), index=True)
    whatsapp_number: Mapped[str | None] = mapped_column(String(30))
    email: Mapped[str | None] = mapped_column(String(255))
    customer_type: Mapped[str] = mapped_column(String(30), default="RETAIL")  # CARPENTER, CONTRACTOR, HOMEOWNER, RETAIL, OTHER
    address: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    credit_limit: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    opening_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped[User | None] = relationship(back_populates="customer_profile")
    projects: Mapped[list["Project"]] = relationship(back_populates="customer", cascade="all, delete-orphan")
    invoices: Mapped[list["Invoice"]] = relationship(back_populates="customer")
    orders: Mapped[list["Order"]] = relationship(back_populates="customer")
    estimates: Mapped[list["Estimate"]] = relationship(back_populates="customer")
    ledger_transactions: Mapped[list["LedgerTransaction"]] = relationship(back_populates="customer")
    loyalty_account: Mapped["LoyaltyAccount | None"] = relationship(back_populates="customer", uselist=False)


class Project(Base):
    __tablename__ = "projects"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    name: Mapped[str] = mapped_column(String(160))
    homeowner_name: Mapped[str | None] = mapped_column(String(120))
    site_address: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(String(30))
    notes: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE")
    start_date: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    customer: Mapped[Customer] = relationship(back_populates="projects")
    invoices: Mapped[list["Invoice"]] = relationship(back_populates="project")
    orders: Mapped[list["Order"]] = relationship(back_populates="project")
    estimates: Mapped[list["Estimate"]] = relationship(back_populates="project")


class ProductCategory(Base):
    __tablename__ = "product_categories"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(String(50), default="door-open")
    tagline: Mapped[str | None] = mapped_column(String(255))
    product_count_label: Mapped[str | None] = mapped_column(String(50), default="100+ Products")
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured_landing: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    products: Mapped[list["Product"]] = relationship(back_populates="category_rel")


class ProductBrand(Base):
    __tablename__ = "product_brands"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    products: Mapped[list["Product"]] = relationship(back_populates="brand_rel")


class Product(Base):
    __tablename__ = "products"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(180), index=True)
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    barcode: Mapped[str | None] = mapped_column(String(80), unique=True, index=True)
    category_id: Mapped[str | None] = mapped_column(ForeignKey("product_categories.id"))
    brand_id: Mapped[str | None] = mapped_column(ForeignKey("product_brands.id"))
    category: Mapped[str | None] = mapped_column(String(80))
    brand: Mapped[str | None] = mapped_column(String(80))
    subtitle: Mapped[str | None] = mapped_column(String(180))
    unit: Mapped[str] = mapped_column(String(30), default="piece")
    purchase_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    original_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    discount_percentage: Mapped[int] = mapped_column(Integer, default=0)
    min_selling_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    hsn_sac: Mapped[str | None] = mapped_column(String(30))
    badge: Mapped[str | None] = mapped_column(String(50))
    badge_type: Mapped[str | None] = mapped_column(String(30), default="bestseller")
    material: Mapped[str | None] = mapped_column(String(120))
    finish: Mapped[str | None] = mapped_column(String(120))
    warranty: Mapped[str | None] = mapped_column(String(120))
    rating: Mapped[Decimal] = mapped_column(Numeric(3, 1), default=4.8)
    review_count: Mapped[int] = mapped_column(Integer, default=24)
    illustration_type: Mapped[str | None] = mapped_column(String(60), default="handle_lever")
    is_bestseller: Mapped[bool] = mapped_column(Boolean, default=False)
    is_recommended: Mapped[bool] = mapped_column(Boolean, default=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    category_rel: Mapped[ProductCategory | None] = relationship(back_populates="products")
    brand_rel: Mapped[ProductBrand | None] = relationship(back_populates="products")
    aliases: Mapped[list["ProductAlias"]] = relationship(back_populates="product", cascade="all, delete-orphan")
    variants: Mapped[list["ProductVariant"]] = relationship(back_populates="product", cascade="all, delete-orphan")
    inventory: Mapped["InventoryItem | None"] = relationship(back_populates="product", uselist=False)


class ProductAlias(Base):
    __tablename__ = "product_aliases"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    alias: Mapped[str] = mapped_column(String(180), index=True)

    product: Mapped[Product] = relationship(back_populates="aliases")


class ProductVariant(Base):
    __tablename__ = "product_variants"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    variant_name: Mapped[str] = mapped_column(String(120))  # e.g., Black, Gold, SS
    sku: Mapped[str] = mapped_column(String(80), unique=True)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    product: Mapped[Product] = relationship(back_populates="variants")


class InventoryItem(Base):
    __tablename__ = "inventory"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), unique=True, index=True)
    on_hand: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    reserved: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    reorder_level: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=5)
    reorder_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=20)
    preferred_supplier_id: Mapped[str | None] = mapped_column(ForeignKey("suppliers.id"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    product: Mapped[Product] = relationship(back_populates="inventory")
    movements: Mapped[list["InventoryMovement"]] = relationship(back_populates="inventory_item")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    inventory_id: Mapped[str] = mapped_column(ForeignKey("inventory.id"), index=True)
    movement_type: Mapped[str] = mapped_column(String(30))  # OPENING, PURCHASE, SALE, RESERVATION, RELEASE, RETURN, DAMAGE, ADJUSTMENT
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    reference_id: Mapped[str | None] = mapped_column(String(80))  # Invoice, Order or PO ID
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    inventory_item: Mapped[InventoryItem] = relationship(back_populates="movements")


class Estimate(Base):
    __tablename__ = "estimates"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    estimate_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"))
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    discount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    tax: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    status: Mapped[str] = mapped_column(String(30), default="DRAFT")  # DRAFT, SENT, APPROVED, REJECTED, CONVERTED
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    customer: Mapped[Customer] = relationship(back_populates="estimates")
    project: Mapped[Project | None] = relationship(back_populates="estimates")
    items: Mapped[list["EstimateItem"]] = relationship(cascade="all, delete-orphan")


class EstimateItem(Base):
    __tablename__ = "estimate_items"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    estimate_id: Mapped[str] = mapped_column(ForeignKey("estimates.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"))
    product_name: Mapped[str] = mapped_column(String(180))
    unit: Mapped[str] = mapped_column(String(30))
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2))


class Order(Base):
    __tablename__ = "orders"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    order_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"))
    source: Mapped[str] = mapped_column(String(30), default="MANUAL")  # MANUAL, WHATSAPP, VOICE, PHOTO, PWA
    status: Mapped[str] = mapped_column(String(30), default="DRAFT")  # DRAFT, PENDING_REVIEW, APPROVED, CONFIRMED, PROCESSING, READY, DISPATCHED, COMPLETED, CANCELLED
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    tax: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    customer: Mapped[Customer] = relationship(back_populates="orders")
    project: Mapped[Project | None] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"))
    product_name: Mapped[str] = mapped_column(String(180))
    unit: Mapped[str] = mapped_column(String(30))
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2))


class Invoice(Base):
    __tablename__ = "invoices"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    invoice_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"))
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    discount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    tax: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    paid: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    status: Mapped[str] = mapped_column(String(30), default="OPEN")  # OPEN, PARTIALLY_PAID, PAID, CANCELLED
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    customer: Mapped[Customer] = relationship(back_populates="invoices")
    project: Mapped[Project | None] = relationship(back_populates="invoices")
    items: Mapped[list["InvoiceItem"]] = relationship(cascade="all, delete-orphan")
    payments: Mapped[list["Payment"]] = relationship(back_populates="invoice")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    invoice_id: Mapped[str] = mapped_column(ForeignKey("invoices.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"))
    product_name: Mapped[str] = mapped_column(String(180))
    unit: Mapped[str] = mapped_column(String(30))
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2))


class Payment(Base):
    __tablename__ = "payments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    invoice_id: Mapped[str] = mapped_column(ForeignKey("invoices.id"), index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    method: Mapped[str] = mapped_column(String(30))  # CASH, UPI, BANK_TRANSFER, CARD, CREDIT, OTHER
    reference: Mapped[str | None] = mapped_column(String(120))
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    invoice: Mapped[Invoice] = relationship(back_populates="payments")


class LedgerTransaction(Base):
    __tablename__ = "ledger_transactions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    invoice_id: Mapped[str | None] = mapped_column(ForeignKey("invoices.id"))
    payment_id: Mapped[str | None] = mapped_column(ForeignKey("payments.id"))
    transaction_type: Mapped[str] = mapped_column(String(30))  # OPENING_BALANCE, CREDIT_SALE, PAYMENT, DEBIT_ADJUSTMENT, CREDIT_ADJUSTMENT, REFUND
    debit: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    credit: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    description: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    customer: Mapped[Customer] = relationship(back_populates="ledger_transactions")


class Supplier(Base):
    __tablename__ = "suppliers"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(120), index=True)
    company: Mapped[str | None] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(30))
    whatsapp: Mapped[str | None] = mapped_column(String(30))
    email: Mapped[str | None] = mapped_column(String(255))
    address: Mapped[str | None] = mapped_column(Text)
    gst_number: Mapped[str | None] = mapped_column(String(30))
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    purchase_orders: Mapped[list["PurchaseOrder"]] = relationship(back_populates="supplier")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    po_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    supplier_id: Mapped[str] = mapped_column(ForeignKey("suppliers.id"), index=True)
    status: Mapped[str] = mapped_column(String(30), default="DRAFT")  # DRAFT, SENT, RECEIVED, PARTIALLY_RECEIVED, CANCELLED
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    supplier: Mapped[Supplier] = relationship(back_populates="purchase_orders")
    items: Mapped[list["PurchaseOrderItem"]] = relationship(cascade="all, delete-orphan")


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    po_id: Mapped[str] = mapped_column(ForeignKey("purchase_orders.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"))
    product_name: Mapped[str] = mapped_column(String(180))
    quantity_ordered: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    quantity_received: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2))


class LoyaltyAccount(Base):
    __tablename__ = "loyalty_accounts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), unique=True, index=True)
    tier: Mapped[str] = mapped_column(String(30), default="BRONZE")  # BRONZE, SILVER, GOLD
    points: Mapped[int] = mapped_column(Integer, default=0)
    total_earned: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    customer: Mapped[Customer] = relationship(back_populates="loyalty_account")
    transactions: Mapped[list["LoyaltyTransaction"]] = relationship(back_populates="loyalty_account")


class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    account_id: Mapped[str] = mapped_column(ForeignKey("loyalty_accounts.id"), index=True)
    points: Mapped[int] = mapped_column(Integer)  # Positive for earn, negative for redeem
    description: Mapped[str] = mapped_column(String(255))
    reference: Mapped[str | None] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    loyalty_account: Mapped[LoyaltyAccount] = relationship(back_populates="transactions")


class LoyaltyReward(Base):
    __tablename__ = "loyalty_rewards"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(120))
    points_required: Mapped[int] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class AIProcessingJob(Base):
    __tablename__ = "ai_processing_jobs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    source_type: Mapped[str] = mapped_column(String(30))  # TEXT, VOICE, PHOTO
    status: Mapped[str] = mapped_column(String(30), default="QUEUED")  # QUEUED, PROCESSING, COMPLETED, REVIEW_REQUIRED, FAILED
    provider: Mapped[str] = mapped_column(String(50), default="internal_ai")
    input_text: Mapped[str | None] = mapped_column(Text)
    file_path: Mapped[str | None] = mapped_column(String(255))
    detected_project: Mapped[str | None] = mapped_column(String(120))
    extracted_data: Mapped[str | None] = mapped_column(Text)  # JSON string
    confidence_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    draft_order_id: Mapped[str | None] = mapped_column(ForeignKey("orders.id"))
    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"))
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(80), index=True)
    entity_name: Mapped[str] = mapped_column(String(80))
    entity_id: Mapped[str | None] = mapped_column(String(80))
    details: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class SystemSetting(Base):
    __tablename__ = "settings"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    key: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    value: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)


class StorefrontContent(Base):
    __tablename__ = "storefront_content"
    section_key: Mapped[str] = mapped_column(String(80), primary_key=True)
    content_json: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class CartSession(Base):
    __tablename__ = "cart_sessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    session_token: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"), nullable=True)
    customer_name: Mapped[str | None] = mapped_column(String(120))
    customer_phone: Mapped[str | None] = mapped_column(String(30))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    items: Mapped[list["CartSessionItem"]] = relationship(cascade="all, delete-orphan", back_populates="cart_session")


class CartSessionItem(Base):
    __tablename__ = "cart_session_items"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    session_id: Mapped[str] = mapped_column(ForeignKey("cart_sessions.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    product_name: Mapped[str] = mapped_column(String(180))
    sku: Mapped[str | None] = mapped_column(String(80))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    image_url: Mapped[str | None] = mapped_column(String(255))
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    cart_session: Mapped[CartSession] = relationship(back_populates="items")
    product: Mapped[Product] = relationship()


class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    session_token: Mapped[str] = mapped_column(String(80), index=True)
    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"), nullable=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    product: Mapped[Product] = relationship()
