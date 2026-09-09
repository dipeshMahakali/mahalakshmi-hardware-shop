import os
from functools import lru_cache


def _env(name: str, default: str) -> str:
    return os.getenv(name, default)


class Settings:
    app_name: str = _env("APP_NAME", "Carpenter Partner API")
    app_env: str = _env("APP_ENV", "local")
    app_debug: bool = _env("APP_DEBUG", "false").lower() == "true"
    secret_key: str = _env("SECRET_KEY", "change-me")
    database_url: str = _env("DATABASE_URL", "sqlite:///./carpenter_partner.db")
    access_token_expire_minutes: int = int(_env("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    cors_origins: str = _env("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174")
    session_cookie_name: str = _env("SESSION_COOKIE_NAME", "smh_session")
    session_cookie_secure: bool = _env("SESSION_COOKIE_SECURE", "false").lower() == "true"
    session_cookie_samesite: str = _env("SESSION_COOKIE_SAMESITE", "lax")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
