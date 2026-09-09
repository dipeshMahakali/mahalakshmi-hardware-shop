from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.ledger import customer_khata
from app.core.database import get_db
from app.dependencies import get_current_user, require_owner_or_staff
from app.models import Customer, Project, User
from app.schemas import CustomerCreate, CustomerResponse, LedgerResponse, ProjectCreate, ProjectResponse

router = APIRouter()


@router.post("", response_model=CustomerResponse)
def create_customer(payload: CustomerCreate, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("", response_model=list[CustomerResponse])
def list_customers(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list(db.scalars(select(Customer).order_by(Customer.name)).all())


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.get(Customer, customer_id)
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return c


@router.post("/{customer_id}/projects", response_model=ProjectResponse)
def create_project(customer_id: str, payload: ProjectCreate, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    if db.get(Customer, customer_id) is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    project = Project(customer_id=customer_id, **payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{customer_id}/projects", response_model=list[ProjectResponse])
def list_projects(customer_id: str, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list(db.scalars(select(Project).where(Project.customer_id == customer_id).order_by(Project.name)).all())


@router.get("/{customer_id}/khata", response_model=LedgerResponse)
def customer_khata_alias(customer_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return customer_khata(customer_id, user, db)

