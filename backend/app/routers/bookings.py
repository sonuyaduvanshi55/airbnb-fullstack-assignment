import secrets
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..models import Booking, Listing, User
from ..schemas import BookingCreate, BookingOut
from ..serializers import serialize_booking

router = APIRouter(prefix="/bookings", tags=["bookings"])


def booking_options():
    return (
        selectinload(Booking.guest),
        selectinload(Booking.listing).selectinload(Listing.host),
        selectinload(Booking.listing).selectinload(Listing.images),
        selectinload(Booking.listing).selectinload(Listing.reviews),
    )


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)) -> dict:
    listing = db.get(Listing, payload.listing_id)
    guest = db.get(User, payload.guest_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    if payload.check_in < date.today():
        raise HTTPException(status_code=422, detail="Check-in date cannot be in the past")
    if payload.guests > listing.max_guests:
        raise HTTPException(status_code=422, detail=f"This listing allows at most {listing.max_guests} guests")

    overlap = db.scalar(
        select(Booking.id).where(
            Booking.listing_id == payload.listing_id,
            Booking.status == "confirmed",
            Booking.check_in < payload.check_out,
            Booking.check_out > payload.check_in,
        )
    )
    if overlap:
        raise HTTPException(status_code=409, detail="These dates are no longer available")

    nights = (payload.check_out - payload.check_in).days
    nightly_total = round(listing.price_per_night * nights, 2)
    service_fee = round(nightly_total * 0.12, 2)
    taxes = round((nightly_total + listing.cleaning_fee + service_fee) * 0.08, 2)
    total_price = round(nightly_total + listing.cleaning_fee + service_fee + taxes, 2)

    booking = Booking(
        listing_id=payload.listing_id,
        guest_id=payload.guest_id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        nightly_total=nightly_total,
        cleaning_fee=listing.cleaning_fee,
        service_fee=service_fee,
        taxes=taxes,
        total_price=total_price,
        status="confirmed",
        confirmation_code=f"STAY-{secrets.token_hex(4).upper()}",
    )
    db.add(booking)
    db.commit()

    statement = select(Booking).where(Booking.id == booking.id).options(*booking_options())
    created = db.execute(statement).scalars().unique().one()
    return serialize_booking(created)


@router.get("/user/{user_id}", response_model=list[BookingOut])
def user_bookings(user_id: int, db: Session = Depends(get_db)) -> list[dict]:
    if not db.get(User, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    statement = (
        select(Booking)
        .where(Booking.guest_id == user_id)
        .options(*booking_options())
        .order_by(Booking.check_in.desc())
    )
    bookings = db.execute(statement).scalars().unique().all()
    return [serialize_booking(booking) for booking in bookings]


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db)) -> dict:
    statement = select(Booking).where(Booking.id == booking_id).options(*booking_options())
    booking = db.execute(statement).scalars().unique().first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return serialize_booking(booking)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db),
) -> Response:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != user_id:
        raise HTTPException(status_code=403, detail="You can cancel only your own booking")
    if booking.status != "confirmed":
        raise HTTPException(status_code=409, detail="Booking is already cancelled")
    if booking.check_in <= date.today():
        raise HTTPException(status_code=409, detail="This stay can no longer be cancelled online")

    booking.status = "cancelled"
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
