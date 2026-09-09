from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user, require_owner_or_staff
from app.models import InventoryItem, Product, User
from app.schemas import InventoryResponse, StockAdjustmentCreate
from app.services import adjust_stock, get_or_create_inventory

router = APIRouter()


@router.get("", response_model=list[InventoryResponse])
def list_inventory(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    products = list(db.scalars(select(Product).where(Product.is_active.is_(True))).all())
    items = []
    for p in products:
        inv = get_or_create_inventory(db, p.id)
        items.append(InventoryResponse(
            id=inv.id,
            product_id=p.id,
            product_name=p.name,
            on_hand=inv.on_hand,
            reserved=inv.reserved,
            available=inv.on_hand - inv.reserved,
            reorder_level=inv.reorder_level,
            reorder_quantity=inv.reorder_quantity
        ))
    return items


@router.post("/adjust", response_model=dict)
def adjust_stock_endpoint(payload: StockAdjustmentCreate, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    inv = adjust_stock(db, payload)
    db.commit()
    return {"success": True, "message": "Stock adjusted", "data": {"on_hand": str(inv.on_hand)}}


@router.get("/reorder", response_model=list[InventoryResponse])
def get_low_stock(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_inv = list_inventory(_, db)
    return [item for item in all_inv if item.available <= item.reorder_level]

