import os
import sys
from pathlib import Path

# Add backend directory to Python sys.path so 'app' and its submodules resolve cleanly on Vercel Serverless
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the main FastAPI application instance
from app.main import app

# Expose app as ASGI callable
__all__ = ["app"]

