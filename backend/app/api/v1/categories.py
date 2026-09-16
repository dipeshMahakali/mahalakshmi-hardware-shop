from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import require_owner_or_staff
from app.models import ProductCategory, User
from app.schemas import (
    ProductCategoryCreate, ProductCategoryResponse, ProductCategoryUpdate
)

router = APIRouter()


@router.get("", response_model=list[ProductCategoryResponse])
def list_categories(
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db)
):
    stmt = select(ProductCategory)
    if not include_inactive:
        stmt = stmt.where(ProductCategory.is_active.is_(True))
    return list(db.scalars(stmt.order_by(ProductCategory.display_order.asc(), ProductCategory.name.asc())).all())


@router.get("/{category_id}", response_model=ProductCategoryResponse)
def get_category(category_id: str, db: Session = Depends(get_db)):
    cat = db.get(ProductCategory, category_id)
    if not cat:
        # Check by slug
        cat = db.execute(select(ProductCategory).where(ProductCategory.slug == category_id)).scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.post("", response_model=ProductCategoryResponse)
def create_category(
    payload: ProductCategoryCreate,
    _: User = Depends(require_owner_or_staff),
    db: Session = Depends(get_db)
):
    existing = db.execute(select(ProductCategory).where(ProductCategory.slug == payload.slug)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")

    cat = ProductCategory(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{category_id}", response_model=ProductCategoryResponse)
def update_category(
    category_id: str,
    payload: ProductCategoryUpdate,
    _: User = Depends(require_owner_or_staff),
    db: Session = Depends(get_db)
):
    cat = db.get(ProductCategory, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(cat, k, v)

    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{category_id}")
def delete_category(
    category_id: str,
    hard_delete: bool = Query(False),
    _: User = Depends(require_owner_or_staff),
    db: Session = Depends(get_db)
):
    cat = db.get(ProductCategory, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    if hard_delete:
        db.delete(cat)
    else:
        cat.is_active = False

    db.commit()
    return {"message": "Category removed", "id": category_id}

