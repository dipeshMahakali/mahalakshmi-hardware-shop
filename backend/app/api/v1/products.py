from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user, require_owner_or_staff
from app.models import Product, ProductAlias, User
from app.schemas import ProductAliasCreate, ProductAliasResponse, ProductCreate, ProductResponse

router = APIRouter()


@router.post("", response_model=ProductResponse)
def create_product(payload: ProductCreate, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"aliases"})
    product = Product(**data)
    db.add(product)
    db.flush()

    for alias_text in payload.aliases:
        db.add(ProductAlias(product_id=product.id, alias=alias_text.strip()))

    db.commit()
    db.refresh(product)
    return product


@router.get("", response_model=list[ProductResponse])
def list_products(
    q: str | None = Query(None),
    category: str | None = Query(None),
    db: Session = Depends(get_db)
):
    stmt = select(Product).where(Product.is_active.is_(True))
    if category and category.lower() != "all":
        stmt = stmt.where(Product.category.ilike(f"%{category}%"))
    if q:
        stmt = stmt.where(
            or_(
                Product.name.ilike(f"%{q}%"),
                Product.sku.ilike(f"%{q}%"),
                Product.barcode == q
            )
        )
    return list(db.scalars(stmt.order_by(Product.name)).all())


@router.post("/{product_id}/aliases", response_model=ProductAliasResponse)
def add_alias(product_id: str, payload: ProductAliasCreate, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    alias = ProductAlias(product_id=product_id, alias=payload.alias)
    db.add(alias)
    db.commit()
    db.refresh(alias)
    return alias

