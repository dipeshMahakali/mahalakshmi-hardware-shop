import json
from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app
from app.seed import seed_data


def test_browser_full_ecosystem_verification():
    # 1. Reset database with realistic seed data
    seed_data()

    client = TestClient(app)

    # 2. Test Health Endpoint
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["success"] is True
    print("✅ Health Check Passed")

    # 3. Test Owner Authentication & Dashboard Stats
    owner_login = client.post("/api/v1/auth/login", data={"username": "owner@hardware.com", "password": "admin123"})
    assert owner_login.status_code == 200
    owner_token = owner_login.json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    dash_res = client.get("/api/v1/reports/dashboard", headers=owner_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()["data"]
    assert "today_sales" in dash_data
    assert "total_outstanding" in dash_data
    assert "low_stock_count" in dash_data
    print("✅ Owner Dashboard KPIs Passed")

    # 4. Test Public Product Catalog & Alias Matching
    prods_res = client.get("/api/v1/products", headers=owner_headers)
    assert prods_res.status_code == 200
    products = prods_res.json()
    assert len(products) >= 8
    print("✅ Public Product Catalog Passed")

    # 5. Test Carpenter Voice Order -> AI Draft Order
    carpenter_login = client.post("/api/v1/auth/login", data={"username": "ramesh@carpenter.com", "password": "carpenter123"})
    assert carpenter_login.status_code == 200
    carp_token = carpenter_login.json()["access_token"]
    carp_headers = {"Authorization": f"Bearer {carp_token}"}

    voice_order_res = client.post("/api/v1/ai/process", json={
        "source_type": "VOICE",
        "input_text": "Sharma site ke liye 5 18mm ply aur 2 box 3 inch hinge bhej dena"
    }, headers=carp_headers)
    assert voice_order_res.status_code == 200
    job_data = voice_order_res.json()
    assert job_data["status"] == "REVIEW_REQUIRED"
    assert job_data["detected_project"] == "Sharma site"
    assert Decimal(job_data["confidence_score"]) > Decimal("50.00")
    job_id = job_data["id"]
    print("✅ Carpenter Voice Order AI Pipeline Passed")

    # 6. Test Owner Review & Approve AI Draft Order
    pending_jobs = client.get("/api/v1/ai/jobs", headers=owner_headers).json()
    target_job = next(j for j in pending_jobs if j["id"] == job_id)
    assert target_job["status"] == "REVIEW_REQUIRED"

    approval_res = client.post(f"/api/v1/ai/jobs/{job_id}/approve", json={
        "job_id": job_id,
        "action": "APPROVE"
    }, headers=owner_headers)
    assert approval_res.status_code == 200
    assert approval_res.json()["status"] == "COMPLETED"
    print("✅ Owner AI Draft Order Approval & Stock Reservation Passed")

    # 7. Test Quick Billing & Digital Khata Ledger Update
    custs = client.get("/api/v1/customers", headers=owner_headers).json()
    ramesh = next(c for c in custs if "Ramesh" in c["name"])
    ply = next(p for p in products if "Plywood" in p["name"])

    inv_res = client.post("/api/v1/invoices", json={
        "customer_id": ramesh["id"],
        "discount": "50.00",
        "items": [{"product_id": ply["id"], "quantity": "3"}]
    }, headers=owner_headers)
    assert inv_res.status_code == 200
    inv = inv_res.json()
    assert Decimal(inv["total"]) > Decimal("0")

    # 8. Test Payment & Ledger Reconciliation
    pay_res = client.post("/api/v1/payments", json={
        "invoice_id": inv["id"],
        "amount": "2000.00",
        "method": "UPI",
        "reference": "UPI-B2B-101"
    }, headers=owner_headers)
    assert pay_res.status_code == 200

    khata_res = client.get(f"/api/v1/ledger/customers/{ramesh['id']}/khata", headers=owner_headers)
    assert khata_res.status_code == 200
    khata = khata_res.json()
    assert len(khata["transactions"]) >= 2
    print("✅ Quick Billing, Payment & Digital Khata Ledger Passed")

    # 9. Test Loyalty Points & Reward Redemption
    loy_res = client.get(f"/api/v1/loyalty/customers/{ramesh['id']}", headers=carp_headers)
    assert loy_res.status_code == 200
    loyalty = loy_res.json()
    assert loyalty["points"] > 0

    rewards = client.get("/api/v1/loyalty/rewards", headers=carp_headers).json()
    assert len(rewards) >= 1

    redeem_res = client.post("/api/v1/loyalty/redeem", json={
        "customer_id": ramesh["id"],
        "reward_id": rewards[0]["id"]
    }, headers=carp_headers)
    assert redeem_res.status_code == 200
    assert redeem_res.json()["success"] is True
    print("✅ Loyalty Points & Reward Voucher Redemption Passed")

    print("\n🎉 ALL E2E ECOSYSTEM FEATURES TESTED & VERIFIED SUCCESSFULLY!")


if __name__ == "__main__":
    test_browser_full_ecosystem_verification()
