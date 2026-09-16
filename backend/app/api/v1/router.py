from fastapi import APIRouter

from app.api.v1 import (
    ai, auth, categories, customers, estimates, inventory, invoices,
    ledger, loyalty, orders, payments, products, reports, storefront, suppliers
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(storefront.router, prefix="/storefront", tags=["storefront"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(estimates.router, prefix="/estimates", tags=["estimates"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(ledger.router, prefix="/ledger", tags=["ledger"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(loyalty.router, prefix="/loyalty", tags=["loyalty"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])

