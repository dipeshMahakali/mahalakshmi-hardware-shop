import pytest
from app.seed import seed_data


@pytest.fixture(scope="session", autouse=True)
def preserve_seed_data():
    yield
    # Automatically restore development and demo seed data after test suite completes
    seed_data()
