import os
import sys
from datetime import date, timedelta
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))
TEST_DB = BACKEND_ROOT / "test_airbnb.db"
if TEST_DB.exists():
    TEST_DB.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB}"
os.environ["FRONTEND_ORIGINS"] = "http://localhost:3000"

from fastapi.testclient import TestClient  # noqa: E402

from app.db import engine  # noqa: E402
from app.main import app  # noqa: E402


def test_health_and_booking_overlap() -> None:
    with TestClient(app) as client:
        assert client.get("/health").json() == {"status": "healthy"}

        listing = client.get("/api/listings/1").json()
        start = date.today() + timedelta(days=90)
        end = start + timedelta(days=3)
        payload = {
            "listing_id": listing["id"],
            "guest_id": 1,
            "check_in": start.isoformat(),
            "check_out": end.isoformat(),
            "guests": 2,
        }
        first = client.post("/api/bookings", json=payload)
        assert first.status_code == 201, first.text

        second = client.post("/api/bookings", json=payload)
        assert second.status_code == 409
        assert second.json()["detail"] == "These dates are no longer available"

    engine.dispose()
    TEST_DB.unlink(missing_ok=True)

