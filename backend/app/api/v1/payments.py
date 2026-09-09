from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user, require_owner_or_staff
from app.models import Payment, User
from app.schemas import PaymentCreate
from app.services import record_payment

router = APIRouter()


@router.post("", response_model=dict)
def create_payment_endpoint(payload: PaymentCreate, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    try:
        payment = record_payment(db, payload)
        db.commit()
        return {"success": True, "message": "Payment recorded", "data": {"id": payment.id}, "errors": None}
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("", response_model=list[dict])
def list_payments(invoice_id: str | None = None, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(Payment)
    if invoice_id:
        stmt = stmt.where(Payment.invoice_id == invoice_id)
    payments = db.scalars(stmt.order_by(Payment.created_at.desc())).all()
    return [{
        "id": p.id,
        "invoice_id": p.invoice_id,
        "customer_id": p.customer_id,
        "amount": str(p.amount),
        "method": p.method,
        "reference": p.reference,
        "created_at": str(p.created_at)
    } for p in payments]

