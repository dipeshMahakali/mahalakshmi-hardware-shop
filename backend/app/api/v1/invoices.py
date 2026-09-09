from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user, require_owner_or_staff
from app.models import Invoice, User
from app.schemas import InvoiceCreate, InvoiceResponse
from app.services import create_invoice

router = APIRouter()


def invoice_response_dto(invoice: Invoice) -> InvoiceResponse:
    return InvoiceResponse(
        id=invoice.id,
        invoice_number=invoice.invoice_number,
        customer_id=invoice.customer_id,
        project_id=invoice.project_id,
        subtotal=invoice.subtotal,
        discount=invoice.discount,
        tax=invoice.tax,
        total=invoice.total,
        paid=invoice.paid,
        outstanding=invoice.total - invoice.paid,
        status=invoice.status,
        items=invoice.items,
        created_at=invoice.created_at
    )


@router.post("", response_model=InvoiceResponse)
def create_invoice_endpoint(payload: InvoiceCreate, _: User = Depends(require_owner_or_staff), db: Session = Depends(get_db)):
    try:
        invoice = create_invoice(db, payload)
        db.commit()
        db.refresh(invoice)
        return invoice_response_dto(invoice)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("", response_model=list[InvoiceResponse])
def list_invoices(customer_id: str | None = None, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(Invoice)
    if customer_id:
        stmt = stmt.where(Invoice.customer_id == customer_id)
    invoices = db.scalars(stmt.order_by(Invoice.created_at.desc())).all()
    return [invoice_response_dto(inv) for inv in invoices]


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: str, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    inv = db.get(Invoice, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice_response_dto(inv)

