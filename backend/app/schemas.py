from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: str | None
    role: str
    is_superhost: bool

    model_config = ConfigDict(from_attributes=True)


class AmenityOut(BaseModel):
    id: int
    name: str
    icon: str

    model_config = ConfigDict(from_attributes=True)


class ImageOut(BaseModel):
    id: int
    url: str
    alt_text: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ReviewOut(BaseModel):
    id: int
    rating: float
    comment: str
    created_at: datetime
    author: UserOut

    model_config = ConfigDict(from_attributes=True)


class ListingSummary(BaseModel):
    id: int
    title: str
    location: str
    country: str
    property_type: str
    price_per_night: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    instant_book: bool
    cover_image: str
    rating: float
    review_count: int
    host: UserOut


class ListingDetail(ListingSummary):
    description: str
    cleaning_fee: float
    latitude: float | None
    longitude: float | None
    images: list[ImageOut]
    amenities: list[AmenityOut]
    reviews: list[ReviewOut]


class PaginatedListings(BaseModel):
    items: list[ListingSummary]
    total: int
    page: int
    page_size: int
    total_pages: int


class ListingCreate(BaseModel):
    host_id: int
    title: str = Field(min_length=5, max_length=180)
    description: str = Field(min_length=20)
    location: str = Field(min_length=2, max_length=180)
    country: str = "India"
    property_type: str = Field(min_length=2, max_length=80)
    price_per_night: float = Field(gt=0)
    cleaning_fee: float = Field(ge=0, default=900)
    max_guests: int = Field(gt=0, le=30)
    bedrooms: int = Field(ge=0, le=30)
    beds: int = Field(gt=0, le=50)
    bathrooms: float = Field(gt=0, le=30)
    latitude: float | None = None
    longitude: float | None = None
    instant_book: bool = True
    image_urls: list[HttpUrl] = Field(min_length=1, max_length=8)
    amenity_names: list[str] = Field(default_factory=list, max_length=20)


class ListingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=180)
    description: str | None = Field(default=None, min_length=20)
    location: str | None = Field(default=None, min_length=2, max_length=180)
    country: str | None = None
    property_type: str | None = None
    price_per_night: float | None = Field(default=None, gt=0)
    cleaning_fee: float | None = Field(default=None, ge=0)
    max_guests: int | None = Field(default=None, gt=0, le=30)
    bedrooms: int | None = Field(default=None, ge=0, le=30)
    beds: int | None = Field(default=None, gt=0, le=50)
    bathrooms: float | None = Field(default=None, gt=0, le=30)
    latitude: float | None = None
    longitude: float | None = None
    instant_book: bool | None = None
    image_urls: list[HttpUrl] | None = Field(default=None, min_length=1, max_length=8)
    amenity_names: list[str] | None = Field(default=None, max_length=20)


class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int = Field(gt=0, le=30)

    @model_validator(mode="after")
    def validate_dates(self) -> "BookingCreate":
        if self.check_out <= self.check_in:
            raise ValueError("Check-out date must be after check-in date")
        return self


class BookingOut(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    nights: int
    nightly_total: float
    cleaning_fee: float
    service_fee: float
    taxes: float
    total_price: float
    status: str
    confirmation_code: str
    created_at: datetime
    listing: ListingSummary
    guest: UserOut


class AvailabilityOut(BaseModel):
    listing_id: int
    unavailable_ranges: list[dict[str, date]]


class FavoriteCreate(BaseModel):
    user_id: int
    listing_id: int


class FavoriteOut(BaseModel):
    id: int
    user_id: int
    listing_id: int
    created_at: datetime
    listing: ListingSummary
