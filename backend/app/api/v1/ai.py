from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.pipeline import process_ai_order
from app.core.database import get_db
from app.dependencies import get_current_user, require_owner_or_staff
from app.models import AIProcessingJob, User
from app.schemas import AIApprovalRequest, AIJobResponse, AIProcessRequest
from app.services import approve_ai_job

router = APIRouter()


@router.post("/process", response_model=AIJobResponse)
def process_ai_request(payload: AIProcessRequest, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        job = process_ai_order(
            db=db,
            source_type=payload.source_type,
            input_text=payload.input_text,
            customer_id=payload.customer_id
        )
        db.commit()
        db.refresh(job)
        return job
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"AI Processing failed: {str(exc)}") from exc


@router.get("/jobs", response_model=list[AIJobResponse])
def list_ai_jobs(_: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    return list(db.scalars(select(AIProcessingJob).order_by(AIProcessingJob.created_at.desc())).all())


@router.post("/jobs/{job_id}/approve", response_model=AIJobResponse)
def approve_job_endpoint(job_id: str, payload: AIApprovalRequest, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    try:
        job = approve_ai_job(db, job_id, payload.action, payload.edited_items)
        db.commit()
        db.refresh(job)
        return job
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc

