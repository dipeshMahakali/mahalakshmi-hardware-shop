from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import require_owner_or_staff
from app.models import AIProcessingJob, Customer, InventoryItem, Invoice, LedgerTransaction, Order, Payment, Product, User

router = APIRouter()


@router.get("/dashboard")
def get_owner_dashboard(_: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    total_sales = db.scalar(select(func.sum(Invoice.total))) or Decimal("0")
    total_payments = db.scalar(select(func.sum(Payment.amount))) or Decimal("0")
    
    # Calculate outstanding balance across all customers
    all_debits = db.scalar(select(func.sum(LedgerTransaction.debit))) or Decimal("0")
    all_credits = db.scalar(select(func.sum(LedgerTransaction.credit))) or Decimal("0")
    all_opening = db.scalar(select(func.sum(Customer.opening_balance))) or Decimal("0")
    total_outstanding = (all_opening + all_debits) - all_credits

    pending_orders_count = db.scalar(select(func.count(Order.id)).where(Order.status == "PENDING_REVIEW")) or 0
    ai_jobs_count = db.scalar(select(func.count(AIProcessingJob.id)).where(AIProcessingJob.status == "REVIEW_REQUIRED")) or 0

    # Low stock items
    products = list(db.scalars(select(Product).where(Product.is_active.is_(True))).all())
    low_stock_count = 0
    for p in products:
        inv = db.scalar(select(InventoryItem).where(InventoryItem.product_id == p.id))
        on_hand = inv.on_hand if inv else Decimal("50")
        reserved = inv.reserved if inv else Decimal("0")
        available = on_hand - reserved
        reorder_level = inv.reorder_level if inv else Decimal("10")
        if available <= reorder_level:
            low_stock_count += 1

    return {
        "success": True,
        "data": {
            "today_sales": str(total_sales),
            "today_payments": str(total_payments),
            "total_outstanding": str(total_outstanding),
            "pending_orders": pending_orders_count,
            "ai_pending_jobs": ai_jobs_count,
            "low_stock_count": low_stock_count,
            "total_products": len(products),
            "total_customers": db.scalar(select(func.count(Customer.id))) or 0
        }
    }

