from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user, require_owner_or_staff
from app.models import PurchaseOrder, Supplier, User
from app.schemas import PurchaseOrderCreate, PurchaseOrderResponse, PurchaseReceiveRequest, SupplierCreate, SupplierResponse
from app.services import create_purchase_order, receive_purchase_order

router = APIRouter()


@router.post("", response_model=SupplierResponse)
def create_supplier(payload: SupplierCreate, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    supplier = Supplier(**payload.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


@router.get("", response_model=list[SupplierResponse])
def list_suppliers(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list(db.scalars(select(Supplier).order_by(Supplier.name)).all())


@router.post("/purchase-orders", response_model=PurchaseOrderResponse)
def create_po_endpoint(payload: PurchaseOrderCreate, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    po = create_purchase_order(db, payload)
    db.commit()
    db.refresh(po)
    return po


@router.get("/purchase-orders", response_model=list[PurchaseOrderResponse])
def list_pos(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list(db.scalars(select(PurchaseOrder).order_by(PurchaseOrder.created_at.desc())).all())


@router.post("/purchase-orders/receive", response_model=PurchaseOrderResponse)
def receive_po_endpoint(payload: PurchaseReceiveRequest, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    try:
        po = receive_purchase_order(db, payload)
        db.commit()
        db.refresh(po)
        return po
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc

