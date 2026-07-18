from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    avatar_url: Mapped[str | None] = mapped_column(String(800))
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="guest")
    is_superhost: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    listings: Mapped[list[Listing]] = relationship(back_populates="host", cascade="all, delete-orphan")
    bookings: Mapped[list[Booking]] = relationship(back_populates="guest", cascade="all, delete-orphan")
    reviews: Mapped[list[Review]] = relationship(back_populates="author", cascade="all, delete-orphan")
    favorites: Mapped[list[Favorite]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Listing(Base):
    __tablename__ = "listings"
    __table_args__ = (
        CheckConstraint("price_per_night >= 0", name="ck_listing_price_nonnegative"),
        CheckConstraint("max_guests > 0", name="ck_listing_guests_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="India")
    property_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    price_per_night: Mapped[float] = mapped_column(Float, nullable=False)
    cleaning_fee: Mapped[float] = mapped_column(Float, nullable=False, default=900)
    max_guests: Mapped[int] = mapped_column(Integer, nullable=False)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    beds: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    bathrooms: Mapped[float] = mapped_column(Float, nullable=False, default=1)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    instant_book: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    host: Mapped[User] = relationship(back_populates="listings")
    images: Mapped[list[ListingImage]] = relationship(
        back_populates="listing",
        cascade="all, delete-orphan",
        order_by="ListingImage.sort_order",
    )
    amenities: Mapped[list[Amenity]] = relationship(secondary=listing_amenities, back_populates="listings")
    bookings: Mapped[list[Booking]] = relationship(back_populates="listing", cascade="all, delete-orphan")
    reviews: Mapped[list[Review]] = relationship(back_populates="listing", cascade="all, delete-orphan")
    favorites: Mapped[list[Favorite]] = relationship(back_populates="listing", cascade="all, delete-orphan")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    alt_text: Mapped[str] = mapped_column(String(255), nullable=False, default="Property image")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    listing: Mapped[Listing] = relationship(back_populates="images")


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    icon: Mapped[str] = mapped_column(String(60), nullable=False, default="sparkles")

    listings: Mapped[list[Listing]] = relationship(secondary=listing_amenities, back_populates="amenities")


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint("check_out > check_in", name="ck_booking_valid_date_range"),
        CheckConstraint("guests > 0", name="ck_booking_guests_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    guest_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    check_in: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    check_out: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    guests: Mapped[int] = mapped_column(Integer, nullable=False)
    nightly_total: Mapped[float] = mapped_column(Float, nullable=False)
    cleaning_fee: Mapped[float] = mapped_column(Float, nullable=False)
    service_fee: Mapped[float] = mapped_column(Float, nullable=False)
    taxes: Mapped[float] = mapped_column(Float, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="confirmed", index=True)
    confirmation_code: Mapped[str] = mapped_column(String(24), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    listing: Mapped[Listing] = relationship(back_populates="bookings")
    guest: Mapped[User] = relationship(back_populates="bookings")


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("listing_id", "author_id", name="uq_review_listing_author"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    listing: Mapped[Listing] = relationship(back_populates="reviews")
    author: Mapped[User] = relationship(back_populates="reviews")


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "listing_id", name="uq_favorite_user_listing"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped[User] = relationship(back_populates="favorites")
    listing: Mapped[Listing] = relationship(back_populates="favorites")
