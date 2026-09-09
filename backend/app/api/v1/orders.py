from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user, require_owner_or_staff
from app.models import Order, User
from app.schemas import OrderCreate, OrderResponse
from app.services import create_order

router = APIRouter()


@router.post("", response_model=OrderResponse)
def create_order_endpoint(payload: OrderCreate, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        order = create_order(db, payload)
        db.commit()
        db.refresh(order)
        return order
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("", response_model=list[OrderResponse])
def list_orders(customer_id: str | None = None, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(Order)
    if customer_id:
        stmt = stmt.where(Order.customer_id == customer_id)
    return list(db.scalars(stmt.order_by(Order.created_at.desc())).all())


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: str, status: str, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    db.refresh(order)
    return order

