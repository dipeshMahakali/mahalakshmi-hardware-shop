from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models import Customer, LedgerTransaction, User
from app.schemas import LedgerResponse, LedgerTransactionResponse

router = APIRouter()


@router.get("/customers/{customer_id}/khata", response_model=LedgerResponse)
def customer_khata(customer_id: str, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    transactions = list(
        db.scalars(
            select(LedgerTransaction)
            .where(LedgerTransaction.customer_id == customer_id)
            .order_by(LedgerTransaction.created_at)
        ).all()
    )

    debit = sum((t.debit for t in transactions), start=customer.opening_balance)
    credit = sum((t.credit for t in transactions), start=0)

    return LedgerResponse(
        customer_id=customer_id,
        opening_balance=customer.opening_balance,
        debit=debit,
        credit=credit,
        outstanding=debit - credit,
        transactions=[
            LedgerTransactionResponse(
                type=item.transaction_type,
                debit=item.debit,
                credit=item.credit,
                description=item.description,
                created_at=item.created_at
            ) for item in transactions
        ]
    )

