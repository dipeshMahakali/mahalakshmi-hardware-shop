from fastapi.testclient import TestClient

from app.core.database import Base, engine
from app.main import app


def test_cookie_session_login_me_logout_and_role_safety():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestClient(app) as client:
        registered = client.post(
            "/api/v1/auth/register",
            params={"name": "Session Owner", "email": "session-owner@example.com", "password": "strong-password", "role": "CARPENTER"},
        )
        assert registered.status_code == 200
        assert registered.cookies.get("smh_session")
        assert registered.json()["role"] == "OWNER"

        session_user = client.get("/api/v1/auth/me")
        assert session_user.status_code == 200
        assert session_user.json()["role"] == "OWNER"

        logged_out = client.post("/api/v1/auth/logout")
        assert logged_out.status_code == 200
        assert client.get("/api/v1/auth/me").status_code == 401

        login = client.post("/api/v1/auth/login", data={"username": "session-owner@example.com", "password": "strong-password"})
        assert login.status_code == 200
        cookie = login.cookies.get("smh_session")
        assert cookie
        assert "HttpOnly" in login.headers["set-cookie"]
        assert "SameSite=lax" in login.headers["set-cookie"]

        logged_in = client.get("/api/v1/auth/me")
        assert logged_in.status_code == 200


def test_cors_rejects_unknown_origin():
    with TestClient(app) as client:
        response = client.options(
            "/api/v1/auth/login",
            headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
        )
        assert response.status_code in {200, 400}
        assert response.headers.get("access-control-allow-origin") != "https://evil.example"
