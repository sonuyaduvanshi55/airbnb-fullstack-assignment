from sqlalchemy.orm import Session

from .models import Booking, Favorite, Listing


def rating_for(listing: Listing) -> tuple[float, int]:
    count = len(listing.reviews)
    if count == 0:
        return 0.0, 0
    return round(sum(review.rating for review in listing.reviews) / count, 2), count


def serialize_listing_summary(listing: Listing) -> dict:
    rating, review_count = rating_for(listing)
    cover_image = listing.images[0].url if listing.images else "https://placehold.co/1200x800?text=Staybnb"
    return {
        "id": listing.id,
        "title": listing.title,
        "location": listing.location,
        "country": listing.country,
        "property_type": listing.property_type,
        "price_per_night": listing.price_per_night,
        "max_guests": listing.max_guests,
        "bedrooms": listing.bedrooms,
        "beds": listing.beds,
        "bathrooms": listing.bathrooms,
        "instant_book": listing.instant_book,
        "cover_image": cover_image,
        "rating": rating,
        "review_count": review_count,
        "host": listing.host,
    }


def serialize_listing_detail(listing: Listing) -> dict:
    data = serialize_listing_summary(listing)
    data.update(
        {
            "description": listing.description,
            "cleaning_fee": listing.cleaning_fee,
            "latitude": listing.latitude,
            "longitude": listing.longitude,
            "images": listing.images,
            "amenities": sorted(listing.amenities, key=lambda item: item.name),
            "reviews": sorted(listing.reviews, key=lambda item: item.created_at, reverse=True),
        }
    )
    return data


def serialize_booking(booking: Booking) -> dict:
    return {
        "id": booking.id,
        "listing_id": booking.listing_id,
        "guest_id": booking.guest_id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guests": booking.guests,
        "nights": (booking.check_out - booking.check_in).days,
        "nightly_total": booking.nightly_total,
        "cleaning_fee": booking.cleaning_fee,
        "service_fee": booking.service_fee,
        "taxes": booking.taxes,
        "total_price": booking.total_price,
        "status": booking.status,
        "confirmation_code": booking.confirmation_code,
        "created_at": booking.created_at,
        "listing": serialize_listing_summary(booking.listing),
        "guest": booking.guest,
    }


def serialize_favorite(favorite: Favorite) -> dict:
    return {
        "id": favorite.id,
        "user_id": favorite.user_id,
        "listing_id": favorite.listing_id,
        "created_at": favorite.created_at,
        "listing": serialize_listing_summary(favorite.listing),
    }
