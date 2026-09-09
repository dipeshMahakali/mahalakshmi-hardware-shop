# Carpenter Partner API

FastAPI modular monolith for the shop's authoritative business workflows.

## Current phase

Phase 0/1 currently includes:

- JWT authentication foundation with owner/staff authorization
- Customers and carpenter projects
- Products with units and configurable tax rates
- Decimal-safe invoice totals
- Partial and full payments
- Immutable credit-sale/payment Khata transactions
- SQLite for local isolated development/tests
- PostgreSQL-compatible `DATABASE_URL` for deployment

AI, WhatsApp, inventory, supplier purchasing, loyalty, and PDF generation remain later phases. The public React catalog is intentionally preserved in the repository root.

## Run locally

```bash
cd backend
cp .env.example .env
/usr/bin/python3 -m uvicorn app.main:app --reload --port 8000
```

OpenAPI is available at `http://localhost:8000/docs`.

## Test

The acceptance test is `tests/test_acceptance.py`.

```bash
cd backend
pytest -q
```

The environment used for initial verification did not expose the pytest executable to `/usr/bin/python3`; the same test function was executed directly with FastAPI `TestClient` after bytecode compilation.

## Database

Local defaults use SQLite. Production should set:

```env
DATABASE_URL=postgresql+psycopg://user:password@postgres:5432/carpenter_partner
```

Schema creation is currently automatic for this first foundation. Before production deployment, replace startup creation with Alembic migrations and require migration checks in CI.
