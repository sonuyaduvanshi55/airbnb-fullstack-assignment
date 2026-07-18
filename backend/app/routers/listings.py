from datetime import date
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..models import Amenity, Booking, Listing, ListingImage, Review, User
from ..schemas import (
    AvailabilityOut,
    ListingCreate,
    ListingDetail,
    ListingSummary,
    ListingUpdate,
    PaginatedListings,
)
from ..serializers import serialize_listing_detail, serialize_listing_summary

router = APIRouter(prefix="/listings", tags=["listings"])


def listing_load_options():
    return (
        selectinload(Listing.host),
        selectinload(Listing.images),
        selectinload(Listing.amenities),
        selectinload(Listing.reviews).selectinload(Review.author),
    )


def get_amenities(db: Session, names: list[str]) -> list[Amenity]:
    normalized = sorted({name.strip() for name in names if name.strip()})
    if not normalized:
        return []

    existing = {
        item.name.lower(): item
        for item in db.scalars(select(Amenity).where(func.lower(Amenity.name).in_([name.lower() for name in normalized]))).all()
    }
    result: list[Amenity] = []
    for name in normalized:
        amenity = existing.get(name.lower())
        if not amenity:
            amenity = Amenity(name=name, icon="sparkles")
            db.add(amenity)
            db.flush()
        result.append(amenity)
    return result


@router.get("", response_model=PaginatedListings)
def list_listings(
    location: str | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = Query(default=None, ge=1),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    property_type: str | None = None,
    amenities: list[str] = Query(default=[]),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=8, ge=1, le=50),
    db: Session = Depends(get_db),
) -> dict:
    if bool(check_in) != bool(check_out):
        raise HTTPException(status_code=422, detail="Both check-in and check-out are required for date filtering")
    if check_in and check_out and check_out <= check_in:
        raise HTTPException(status_code=422, detail="Check-out must be after check-in")
    if min_price is not None and max_price is not None and max_price < min_price:
        raise HTTPException(status_code=422, detail="Maximum price cannot be lower than minimum price")

    statement = select(Listing).options(*listing_load_options()).order_by(Listing.created_at.desc(), Listing.id)

    if location:
        search_term = f"%{location.strip().lower()}%"
        statement = statement.where(
            or_(func.lower(Listing.location).like(search_term), func.lower(Listing.country).like(search_term))
        )
    if guests:
        statement = statement.where(Listing.max_guests >= guests)
    if min_price is not None:
        statement = statement.where(Listing.price_per_night >= min_price)
    if max_price is not None:
        statement = statement.where(Listing.price_per_night <= max_price)
    if property_type:
        statement = statement.where(func.lower(Listing.property_type) == property_type.strip().lower())
    if amenities:
        for amenity_name in {name.strip().lower() for name in amenities if name.strip()}:
            statement = statement.where(
                Listing.amenities.any(func.lower(Amenity.name) == amenity_name)
            )
    if check_in and check_out:
        unavailable_listing_ids = select(Booking.listing_id).where(
            Booking.status == "confirmed",
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
        statement = statement.where(~Listing.id.in_(unavailable_listing_ids))

    all_items = db.execute(statement).scalars().unique().all()
    total = len(all_items)
    start = (page - 1) * page_size
    page_items = all_items[start : start + page_size]

    return {
        "items": [serialize_listing_summary(item) for item in page_items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, ceil(total / page_size)),
    }


@router.get("/{listing_id}", response_model=ListingDetail)
def get_listing(listing_id: int, db: Session = Depends(get_db)) -> dict:
    statement = select(Listing).where(Listing.id == listing_id).options(*listing_load_options())
    listing = db.execute(statement).scalars().unique().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return serialize_listing_detail(listing)


@router.get("/{listing_id}/availability", response_model=AvailabilityOut)
def get_availability(listing_id: int, db: Session = Depends(get_db)) -> dict:
    if not db.get(Listing, listing_id):
        raise HTTPException(status_code=404, detail="Listing not found")
    bookings = db.scalars(
        select(Booking)
        .where(Booking.listing_id == listing_id, Booking.status == "confirmed")
        .order_by(Booking.check_in)
    ).all()
    return {
        "listing_id": listing_id,
        "unavailable_ranges": [
            {"check_in": booking.check_in, "check_out": booking.check_out} for booking in bookings
        ],
    }


@router.post("", response_model=ListingDetail, status_code=status.HTTP_201_CREATED)
def create_listing(payload: ListingCreate, db: Session = Depends(get_db)) -> dict:
    host = db.get(User, payload.host_id)
    if not host or host.role != "host":
        raise HTTPException(status_code=403, detail="A valid host account is required")

    listing_data = payload.model_dump(exclude={"image_urls", "amenity_names"})
    listing = Listing(**listing_data)
    listing.images = [
        ListingImage(url=str(url), alt_text=f"{payload.title} photo {index + 1}", sort_order=index)
        for index, url in enumerate(payload.image_urls)
    ]
    listing.amenities = get_amenities(db, payload.amenity_names)
    db.add(listing)
    db.commit()

    statement = select(Listing).where(Listing.id == listing.id).options(*listing_load_options())
    created = db.execute(statement).scalars().unique().one()
    return serialize_listing_detail(created)


@router.put("/{listing_id}", response_model=ListingDetail)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    host_id: int = Query(...),
    db: Session = Depends(get_db),
) -> dict:
    statement = select(Listing).where(Listing.id == listing_id).options(*listing_load_options())
    listing = db.execute(statement).scalars().unique().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="You can edit only your own listings")

    changes = payload.model_dump(exclude_unset=True, exclude={"image_urls", "amenity_names"})
    for field, value in changes.items():
        setattr(listing, field, value)

    if payload.image_urls is not None:
        listing.images.clear()
        listing.images.extend(
            ListingImage(url=str(url), alt_text=f"{listing.title} photo {index + 1}", sort_order=index)
            for index, url in enumerate(payload.image_urls)
        )
    if payload.amenity_names is not None:
        listing.amenities = get_amenities(db, payload.amenity_names)

    db.commit()
    refreshed = db.execute(statement).scalars().unique().one()
    return serialize_listing_detail(refreshed)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    host_id: int = Query(...),
    db: Session = Depends(get_db),
) -> Response:
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="You can delete only your own listings")
    db.delete(listing)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
