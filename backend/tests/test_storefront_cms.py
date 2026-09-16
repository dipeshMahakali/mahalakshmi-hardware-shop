from fastapi.testclient import TestClient
from app.main import app
from app.seed import seed_data


def test_categories_and_storefront_cms():
    seed_data()
    with TestClient(app) as client:
        # 1. Test public categories listing
        cat_res = client.get("/api/v1/categories")
        assert cat_res.status_code == 200
        categories = cat_res.json()
        assert len(categories) >= 7
        assert any(c["slug"] == "door-hardware" for c in categories)

        # 2. Test public storefront content retrieval
        content_res = client.get("/api/v1/storefront/content")
        assert content_res.status_code == 200
        content = content_res.json()
        assert "hero" in content
        assert "promo_banner" in content
        assert "trust_features" in content
        assert "shop_by_need" in content
        assert "business_services" in content
        assert "why_choose_us" in content
        assert "header_utility" in content
        assert "footer" in content

        # 3. Test owner login
        login_res = client.post("/api/v1/auth/login", data={"username": "owner@hardware.com", "password": "admin123"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 4. Test updating a CMS section
        new_hero = dict(content["hero"])
        new_hero["title"] = "Engineered"
        new_hero["highlight"] = "Luxury."
        put_hero = client.put("/api/v1/storefront/content/hero", json={"content": new_hero}, headers=headers)
        assert put_hero.status_code == 200

        # Verify updated hero
        get_hero = client.get("/api/v1/storefront/content/hero")
        assert get_hero.status_code == 200
        assert get_hero.json()["title"] == "Engineered"
        assert get_hero.json()["highlight"] == "Luxury."

        # 5. Test Showcase Curation Patch
        prods = client.get("/api/v1/products").json()
        first_prod = prods[0]
        patch_res = client.patch(
            f"/api/v1/products/{first_prod['id']}/curation",
            json={"is_bestseller": True, "is_recommended": True, "badge": "FEATURED"},
            headers=headers
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["is_bestseller"] is True
        assert patch_res.json()["is_recommended"] is True
        assert patch_res.json()["badge"] == "FEATURED"

        # 6. Test Cart Sync
        cart_sync_res = client.post(
            "/api/v1/storefront/cart/sync",
            json={
                "session_token": "test-session-123",
                "customer_name": "Test Visitor",
                "items": [
                    {
                        "product_id": first_prod["id"],
                        "product_name": first_prod["name"],
                        "sku": first_prod["sku"],
                        "unit_price": float(first_prod["selling_price"]),
                        "quantity": 2
                    }
                ]
            }
        )
        assert cart_sync_res.status_code == 200
        assert cart_sync_res.json()["success"] is True

        # 7. Test Wishlist Sync
        wish_sync_res = client.post(
            "/api/v1/storefront/wishlist/sync",
            json={
                "session_token": "test-session-123",
                "product_ids": [first_prod["id"]]
            }
        )
        assert wish_sync_res.status_code == 200
        assert wish_sync_res.json()["success"] is True

        # 8. Test Engagement Overview telemetry
        eng_res = client.get("/api/v1/storefront/engagement", headers=headers)
        assert eng_res.status_code == 200
        eng_data = eng_res.json()
        assert eng_data["total_active_carts"] >= 1
        assert eng_data["total_wishlisted_items"] >= 1
