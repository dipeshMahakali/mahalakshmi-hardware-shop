from decimal import Decimal
from fastapi.testclient import TestClient

from app.core.database import Base, engine
from app.main import app
from app.seed import seed_data


def setup_function():
    seed_data()


def test_financial_calculations_and_khata():
    with TestClient(app) as client:
        # Login
        login_res = client.post("/api/v1/auth/login", data={"username": "owner@hardware.com", "password": "admin123"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Get Ramesh Carpenter
        custs = client.get("/api/v1/customers", headers=headers).json()
        ramesh = next(c for c in custs if c["name"] == "Ramesh Carpenter")

        # Get Products
        prods = client.get("/api/v1/products", headers=headers).json()
        ply = next(p for p in prods if "Plywood" in p["name"])
        hinge = next(p for p in prods if "Hinge" in p["name"])

        # Create Invoice
        inv_payload = {
            "customer_id": ramesh["id"],
            "discount": "100.00",
            "items": [
                {"product_id": ply["id"], "quantity": "2"},    # 2 * 2450 = 4900
                {"product_id": hinge["id"], "quantity": "5"}   # 5 * 780 = 3900
            ]
        }
        inv_res = client.post("/api/v1/invoices", json=inv_payload, headers=headers)
        assert inv_res.status_code == 200
        inv_data = inv_res.json()

        # Subtotal = 4900 + 3900 = 8800. Discount = 100. Taxable = 8700.
        # Tax = 18% of 8700 = 1566. Total = 8700 + 1566 = 10266.
        assert Decimal(inv_data["subtotal"]) == Decimal("8800.00")
        assert Decimal(inv_data["discount"]) == Decimal("100.00")
        assert Decimal(inv_data["tax"]) == Decimal("1566.00")
        assert Decimal(inv_data["total"]) == Decimal("10266.00")

        # Record Partial Payment
        pay_res = client.post("/api/v1/payments", json={
            "invoice_id": inv_data["id"],
            "amount": "5000.00",
            "method": "UPI",
            "reference": "UPI-REF-99"
        }, headers=headers)
        assert pay_res.status_code == 200

        # Check Digital Khata
        khata_res = client.get(f"/api/v1/ledger/customers/{ramesh['id']}/khata", headers=headers)
        assert khata_res.status_code == 200
        khata_data = khata_res.json()

        # Opening balance = 5000, Debit = 10266, Credit = 5000
        # Outstanding = 5000 + 10266 - 5000 = 10266
        assert Decimal(khata_data["opening_balance"]) == Decimal("5000.00")
        assert Decimal(khata_data["debit"]) == Decimal("15266.00")
        assert Decimal(khata_data["credit"]) == Decimal("5000.00")
        assert Decimal(khata_data["outstanding"]) == Decimal("10266.00")

