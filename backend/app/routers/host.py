from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..models import Booking, Listing, User
from ..schemas import BookingOut, ListingSummary
from ..serializers import serialize_booking, serialize_listing_summary
from .bookings import booking_options
from .listings import listing_load_options

router = APIRouter(prefix="/host", tags=["host"])


def ensure_host(db: Session, host_id: int) -> User:
    host = db.get(User, host_id)
    if not host or host.role != "host":
        raise HTTPException(status_code=404, detail="Host not found")
    return host


@router.get("/{host_id}/listings", response_model=list[ListingSummary])
def host_listings(host_id: int, db: Session = Depends(get_db)) -> list[dict]:
    ensure_host(db, host_id)
    listings = db.execute(
        select(Listing)
        .where(Listing.host_id == host_id)
        .options(*listing_load_options())
        .order_by(Listing.created_at.desc())
    ).scalars().unique().all()
    return [serialize_listing_summary(listing) for listing in listings]


@router.get("/{host_id}/bookings", response_model=list[BookingOut])
def host_bookings(host_id: int, db: Session = Depends(get_db)) -> list[dict]:
    ensure_host(db, host_id)
    bookings = db.execute(
        select(Booking)
        .join(Booking.listing)
        .where(Listing.host_id == host_id)
        .options(*booking_options())
        .order_by(Booking.check_in.desc())
    ).scalars().unique().all()
    return [serialize_booking(booking) for booking in bookings]
