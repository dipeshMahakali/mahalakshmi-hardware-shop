from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app
from app.seed import seed_data


def setup_function():
    seed_data()


def test_ai_order_processing_and_approval():
    with TestClient(app) as client:
        login_res = client.post("/api/v1/auth/login", data={"username": "owner@hardware.com", "password": "admin123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Process AI text order input
        ai_res = client.post("/api/v1/ai/process", json={
            "source_type": "TEXT",
            "input_text": "Sharma site ke liye 5 18mm ply aur 2 box 3 inch hinge bhej dena"
        }, headers=headers)

        assert ai_res.status_code == 200
        job_data = ai_res.json()
        assert job_data["status"] == "REVIEW_REQUIRED"
        assert job_data["detected_project"] == "Sharma site"
        assert Decimal(job_data["confidence_score"]) > Decimal("50.00")
        assert job_data["draft_order_id"] is not None

        # Owner approves job
        appr_res = client.post(f"/api/v1/ai/jobs/{job_data['id']}/approve", json={
            "job_id": job_data["id"],
            "action": "APPROVE"
        }, headers=headers)

        assert appr_res.status_code == 200
        assert appr_res.json()["status"] == "COMPLETED"

