from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import require_owner_or_staff
from app.models import InventoryItem, Product, ProductAlias, User
from app.schemas import (
    ProductAliasCreate, ProductAliasResponse, ProductCreate,
    ProductResponse, ProductUpdate, ShowcaseCurationPatch
)

router = APIRouter()


@router.post("", response_model=ProductResponse)
def create_product(
    payload: ProductCreate,
    _: User = Depends(require_owner_or_staff),
    db: Session = Depends(get_db)
):
    data = payload.model_dump(exclude={"aliases"})
    product = Product(**data)
    db.add(product)
    db.flush()

    for alias_text in payload.aliases:
        if alias_text.strip():
            db.add(ProductAlias(product_id=product.id, alias=alias_text.strip()))

    # Initialize inventory record if not existing
    inv = db.execute(select(InventoryItem).where(InventoryItem.product_id == product.id)).scalar_one_or_none()
    if not inv:
        db.add(InventoryItem(product_id=product.id, on_hand=10, reserved=0, reorder_level=5, reorder_quantity=20))

    db.commit()
    db.refresh(product)
    return product


@router.get("", response_model=list[ProductResponse])
def list_products(
    q: str | None = Query(None),
    category: str | None = Query(None),
    bestseller: bool | None = Query(None),
    recommended: bool | None = Query(None),
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db)
):
    stmt = select(Product)
    if not include_inactive:
        stmt = stmt.where(Product.is_active.is_(True))

    if category and category.lower() != "all":
        stmt = stmt.where(
            or_(
                Product.category.ilike(f"%{category}%"),
                Product.category_id == category
            )
        )

    if bestseller is not None:
        stmt = stmt.where(Product.is_bestseller.is_(bestseller))

    if recommended is not None:
        stmt = stmt.where(Product.is_recommended.is_(recommended))

    if q:
        stmt = stmt.where(
            or_(
                Product.name.ilike(f"%{q}%"),
                Product.sku.ilike(f"%{q}%"),
                Product.barcode == q,
                Product.brand.ilike(f"%{q}%"),
                Product.material.ilike(f"%{q}%")
            )
        )

    return list(db.scalars(stmt.order_by(Product.display_order.asc(), Product.name.asc())).all())


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    _: User = Depends(require_owner_or_staff),
    db: Session = Depends(get_db)
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}/curation", response_model=ProductResponse)
def patch_curation(
    product_id: str,
    payload: ShowcaseCurationPatch,
    _: User = Depends(require_owner_or_staff),
    db: Session = Depends(get_db)
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    hard_delete: bool = Query(False),
    _: User = Depends(require_owner_or_staff),
    db: Session = Depends(get_db)
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if hard_delete:
        db.delete(product)
    else:
        product.is_active = False

    db.commit()
    return {"message": "Product removed successfully", "id": product_id}


@router.post("/{product_id}/aliases", response_model=ProductAliasResponse)
def add_alias(
    product_id: str,
    payload: ProductAliasCreate,
    _: User = Depends(require_owner_or_staff),
    db: Session = Depends(get_db)
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    alias = ProductAlias(product_id=product_id, alias=payload.alias)
    db.add(alias)
    db.commit()
    db.refresh(alias)
    return alias

