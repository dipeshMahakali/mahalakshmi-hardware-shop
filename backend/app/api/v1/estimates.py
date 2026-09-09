from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user, require_owner_or_staff
from app.models import Estimate, User
from app.schemas import EstimateCreate, EstimateResponse
from app.services import create_estimate

router = APIRouter()


@router.post("", response_model=EstimateResponse)
def create_estimate_endpoint(payload: EstimateCreate, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    try:
        est = create_estimate(db, payload)
        db.commit()
        db.refresh(est)
        return est
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("", response_model=list[EstimateResponse])
def list_estimates(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list(db.scalars(select(Estimate).order_by(Estimate.created_at.desc())).all())

