"use client";

import { Heart, Star } from "lucide-react";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import type { ListingSummary } from "@/lib/types";

export function ListingCard({
  listing,
  favorite,
  onFavorite
}: {
  listing: ListingSummary;
  favorite: boolean;
  onFavorite: (listingId: number) => void;
}) {
  return (
    <article className="listing-card">
      <div className="listing-image-wrap">
        <Link href={`/listings/${listing.id}`} aria-label={`View ${listing.title}`}>
          <img src={listing.cover_image} alt={listing.title} className="listing-image" loading="lazy" />
        </Link>
        {listing.instant_book && <span className="guest-favorite-badge">Guest favourite</span>}
        <button
          type="button"
          className={favorite ? "favorite-button active" : "favorite-button"}
          aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => onFavorite(listing.id)}
        >
          <Heart size={24} fill={favorite ? "currentColor" : "rgba(0,0,0,.25)"} />
        </button>
      </div>
      <Link href={`/listings/${listing.id}`} className="listing-card-body">
        <div className="listing-card-title-row">
          <h3>{listing.location}</h3>
          <span>
            <Star size={14} fill="currentColor" />
            {listing.rating || "New"}
          </span>
        </div>
        <p>{listing.title}</p>
        <p>
          {listing.bedrooms} bedroom{listing.bedrooms === 1 ? "" : "s"} · {listing.max_guests} guests
        </p>
        <strong>
          {formatCurrency(listing.price_per_night)} <span>night</span>
        </strong>
      </Link>
    </article>
  );
}
