from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app
from app.seed import seed_data


def setup_function():
    seed_data()


def test_inventory_movements_and_reservations():
    with TestClient(app) as client:
        login_res = client.post("/api/v1/auth/login", data={"username": "owner@hardware.com", "password": "admin123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # List inventory
        inv_list = client.get("/api/v1/inventory", headers=headers).json()
        ply_item = next(i for i in inv_list if "PLY" in i["product_name"] or "Plywood" in i["product_name"])
        
        orig_on_hand = Decimal(ply_item["on_hand"])
        orig_reserved = Decimal(ply_item["reserved"])
        orig_available = Decimal(ply_item["available"])

        assert orig_available == (orig_on_hand - orig_reserved)

        # Adjust stock
        adj_res = client.post("/api/v1/inventory/adjust", json={
            "product_id": ply_item["product_id"],
            "quantity_delta": "10.00",
            "movement_type": "PURCHASE",
            "notes": "Restock shipment"
        }, headers=headers)
        assert adj_res.status_code == 200

        # Verify updated on_hand
        updated_inv = client.get("/api/v1/inventory", headers=headers).json()
        ply_updated = next(i for i in updated_inv if i["product_id"] == ply_item["product_id"])
        assert Decimal(ply_updated["on_hand"]) == orig_on_hand + Decimal("10.00")

