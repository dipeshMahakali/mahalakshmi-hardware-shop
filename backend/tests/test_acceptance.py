from decimal import Decimal

from fastapi.testclient import TestClient

from app.core.database import Base, engine
from app.main import app


Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


def test_owner_bill_payment_and_khata_workflow():
    with TestClient(app) as client:
        registration = client.post("/api/v1/auth/register", params={"name": "Shop Owner", "email": "owner@example.com", "password": "strong-password"})
        assert registration.status_code == 200
        token = registration.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        customer = client.post("/api/v1/customers", headers=headers, json={"name": "Ramesh Carpenter", "phone": "9876543210", "customer_type": "CARPENTER"})
        assert customer.status_code == 200
        customer_id = customer.json()["id"]

        project = client.post(f"/api/v1/customers/{customer_id}/projects", headers=headers, json={"name": "Sharma Residence"})
        assert project.status_code == 200
        project_id = project.json()["id"]

        ply = client.post("/api/v1/products", headers=headers, json={"name": "18mm Commercial Ply", "sku": "PLY-18-C", "unit": "sheet", "selling_price": "2500", "tax_rate": "18"})
        hinge = client.post("/api/v1/products", headers=headers, json={"name": "3 Inch Stainless Hinge", "sku": "HINGE-3-SS", "unit": "box", "selling_price": "800", "tax_rate": "18"})
        assert ply.status_code == hinge.status_code == 200

        invoice = client.post("/api/v1/invoices", headers=headers, json={"customer_id": customer_id, "project_id": project_id, "items": [{"product_id": ply.json()["id"], "quantity": "5"}, {"product_id": hinge.json()["id"], "quantity": "2"}]})
        assert invoice.status_code == 200
        invoice_data = invoice.json()
        assert Decimal(invoice_data["subtotal"]) == Decimal("14100.00")
        assert Decimal(invoice_data["tax"]) == Decimal("2538.00")
        assert Decimal(invoice_data["total"]) == Decimal("16638.00")

        payment = client.post("/api/v1/payments", headers=headers, json={"invoice_id": invoice_data["id"], "amount": "5000", "method": "UPI", "reference": "UPI-123"})
        assert payment.status_code == 200

        khata = client.get(f"/api/v1/customers/{customer_id}/khata", headers=headers)
        assert khata.status_code == 200
        assert Decimal(khata.json()["outstanding"]) == Decimal("11638.00")
        assert len(khata.json()["transactions"]) == 2
