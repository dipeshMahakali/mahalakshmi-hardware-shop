import os
from pathlib import Path
import pytest

# Ensure isolated SQLite database for all automated tests so development/production DB is never touched
TEST_DB_PATH = Path(__file__).resolve().parent / "test_isolated.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["APP_ENV"] = "test"

# Clear cached settings so new test DATABASE_URL is loaded
from app.core.config import get_settings
get_settings.cache_clear()

from app.core.database import Base, engine
from app.seed import seed_data


@pytest.fixture(scope="session", autouse=True)
def setup_isolated_test_db():
    # 1. Initialize schema and seed in isolated test DB
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_data(drop_existing=True)
    yield
    # 2. Cleanup isolated test DB
    try:
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if TEST_DB_PATH.exists():
            TEST_DB_PATH.unlink()
    except Exception:
        pass
