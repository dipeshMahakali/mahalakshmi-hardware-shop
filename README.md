# Carpenter Partner Ecosystem

A simple digital shop assistant for Shree Mahalaxmi Hardware.

The repository contains two cooperating applications:

- `frontend/`: existing React/Vite public catalog. Its visual storefront remains intact.
- `backend/`: FastAPI modular monolith for authoritative shop workflows.

## Phase 0/1 implemented

- FastAPI API with OpenAPI docs
- JWT authentication foundation
- Owner/staff authorization boundary
- Customer and carpenter project records
- Product records with units and configurable tax rates
- Decimal-safe invoice calculations
- Partial/full payment recording
- Immutable credit-sale and payment Khata transactions
- SQLite local test mode and PostgreSQL Docker configuration
- React API client at `frontend/src/api/businessApi.js`
- End-to-end acceptance test for customer -> project -> products -> invoice -> payment -> Khata

AI, WhatsApp, inventory, suppliers, loyalty, and PDF delivery are deliberately deferred until the core financial workflow is reliable.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Build verification:

```bash
cd frontend
npm run build
```

Set `VITE_API_URL` when connecting owner workflows to the API. It defaults to `http://localhost:8000`.

## Backend

```bash
cd backend
cp .env.example .env
/usr/bin/python3 -m uvicorn app.main:app --reload --port 8000
```

OpenAPI: `http://localhost:8000/docs`

Run the acceptance workflow:

```bash
cd backend
/usr/bin/python3 -m compileall -q app tests
/usr/bin/python3 -c 'from tests.test_acceptance import test_owner_bill_payment_and_khata_workflow; test_owner_bill_payment_and_khata_workflow(); print("acceptance workflow passed")'
```

## Docker services

`docker-compose.yml` defines the FastAPI service, PostgreSQL, and Redis. The current code uses PostgreSQL through `DATABASE_URL`; Redis is reserved for the upcoming Celery/background-job phase.

```bash
docker compose up --build
```
