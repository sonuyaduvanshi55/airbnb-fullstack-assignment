"use client";

import { BadgeCheck, BriefcaseBusiness, Car, Coffee, CookingPot, Heart, MapPin, PawPrint, Share2, Snowflake, Star, WashingMachine, Waves, Wifi } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useCurrentUser, useToast } from "@/components/AppProviders";
import { BookingCard } from "@/components/BookingCard";
import { Header } from "@/components/Header";
import { PhotoGallery } from "@/components/PhotoGallery";
import { LoadingState } from "@/components/StateViews";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Availability, ListingDetail } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  wifi: Wifi,
  "cooking-pot": CookingPot,
  waves: Waves,
  snowflake: Snowflake,
  car: Car,
  laptop: BriefcaseBusiness,
  coffee: Coffee,
  "washing-machine": WashingMachine,
  "paw-print": PawPrint,
  bath: Waves,
  mountain: MapPin,
  umbrella: Waves,
  sparkles: BadgeCheck
};

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const listingId = Number(params.id);
  const { user } = useCurrentUser();
  const { showToast } = useToast();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [detail, available, favorites] = await Promise.all([
        api.getListing(listingId),
        api.getAvailability(listingId),
        api.getFavorites(user.id)
      ]);
      setListing(detail);
      setAvailability(available);
      setFavorite(favorites.some((item) => item.listing_id === listingId));
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load this stay", "error");
    } finally {
      setLoading(false);
    }
  }, [listingId, showToast, user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !listing) {
    return (
      <>
        <Header />
        <LoadingState label="Opening this stay…" />
      </>
    );
  }

  const toggleFavorite = async () => {
    try {
      if (favorite) await api.removeFavorite(user.id, listing.id);
      else await api.addFavorite(user.id, listing.id);
      setFavorite(!favorite);
      showToast(favorite ? "Removed from your wishlist" : "Saved to your wishlist", favorite ? "info" : "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update wishlist", "error");
    }
  };

  return (
    <>
      <Header />
      <main className="detail-shell">
        <section className="detail-title-block">
          <h1>{listing.title}</h1>
          <div className="detail-meta-row">
            <div>
              <span><Star size={15} fill="currentColor" /> {listing.rating}</span>
              <button type="button">{listing.review_count} reviews</button>
              {listing.host.is_superhost && <span>· Superhost</span>}
              <span>· {listing.location}, {listing.country}</span>
            </div>
            <div>
              <button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => showToast("Link copied"))}>
                <Share2 size={16} /> Share
              </button>
              <button type="button" onClick={toggleFavorite}>
                <Heart size={16} fill={favorite ? "currentColor" : "none"} /> {favorite ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </section>

        <PhotoGallery images={listing.images} title={listing.title} />

        <div className="detail-layout">
          <div className="detail-main-column">
            <section className="host-summary">
              <div>
                <h2>{listing.property_type} hosted by {listing.host.name}</h2>
                <p>{listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} baths</p>
              </div>
              <img src={listing.host.avatar_url || "https://i.pravatar.cc/100"} alt={listing.host.name} />
            </section>

            <section className="feature-list">
              <div>
                <BadgeCheck size={24} />
                <div><h3>{listing.host.is_superhost ? `${listing.host.name} is a Superhost` : "Experienced host"}</h3><p>Responsive, highly rated, and committed to great stays.</p></div>
              </div>
              <div>
                <MapPin size={24} />
                <div><h3>Great location</h3><p>Guests love the setting and access to local attractions.</p></div>
              </div>
              <div>
                <BadgeCheck size={24} />
                <div><h3>{listing.instant_book ? "Instant booking" : "Request to book"}</h3><p>{listing.instant_book ? "Book immediately without waiting for host approval." : "The host reviews booking requests quickly."}</p></div>
              </div>
            </section>

            <section className="description-section">
              <p>{listing.description}</p>
            </section>

            <section className="amenities-section">
              <h2>What this place offers</h2>
              <div className="amenities-grid">
                {listing.amenities.map((amenity) => {
                  const Icon = iconMap[amenity.icon] || BadgeCheck;
                  return <div key={amenity.id}><Icon size={22} /><span>{amenity.name}</span></div>;
                })}
              </div>
            </section>

            <section className="map-section">
              <h2>Where you&apos;ll be</h2>
              <p>{listing.location}, {listing.country}</p>
              <div className="static-map">
                <div className="map-road road-one" />
                <div className="map-road road-two" />
                <div className="map-water" />
                <div className="map-pin"><MapPin size={24} fill="currentColor" /></div>
                <span>{listing.location}</span>
              </div>
            </section>

            <section className="reviews-section">
              <h2><Star size={20} fill="currentColor" /> {listing.rating} · {listing.review_count} reviews</h2>
              <div className="reviews-grid">
                {listing.reviews.map((review) => (
                  <article key={review.id} className="review-card">
                    <div className="review-author">
                      <img src={review.author.avatar_url || "https://i.pravatar.cc/80"} alt={review.author.name} />
                      <div><strong>{review.author.name}</strong><span>{formatDate(review.created_at.slice(0, 10))}</span></div>
                    </div>
                    <div className="review-stars">★★★★★ <span>{review.rating}</span></div>
                    <p>{review.comment}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <BookingCard listing={listing} availability={availability} guestId={user.id} />
        </div>
      </main>
    </>
  );
}
