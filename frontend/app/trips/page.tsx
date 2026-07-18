"use client";

import { CalendarDays, CircleCheck, MapPin, UsersRound } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useCurrentUser, useToast } from "@/components/AppProviders";
import { Header } from "@/components/Header";
import { EmptyState, LoadingState } from "@/components/StateViews";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

export default function TripsPage() {
  const { user } = useCurrentUser();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setBookings(await api.getTrips(user.id));
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load trips", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const cancel = async (booking: Booking) => {
    if (!window.confirm(`Cancel booking ${booking.confirmation_code}?`)) return;
    try {
      await api.cancelBooking(booking.id, user.id);
      showToast("Booking cancelled", "info");
      await load();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not cancel booking", "error");
    }
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <div className="page-heading">
          <span className="eyebrow">Guest dashboard</span>
          <h1>My trips</h1>
          <p>Review confirmed stays, booking totals, and reservation codes.</p>
        </div>

        {loading ? <LoadingState label="Loading your trips…" /> : bookings.length === 0 ? (
          <EmptyState title="No trips booked yet" message="Explore stays and reserve your first getaway." />
        ) : (
          <div className="trip-list">
            {bookings.map((booking) => (
              <article key={booking.id} className="trip-card">
                <Link href={`/listings/${booking.listing_id}`} className="trip-image-link">
                  <img src={booking.listing.cover_image} alt={booking.listing.title} />
                </Link>
                <div className="trip-content">
                  <div className="trip-topline">
                    <span className={`status-badge status-${booking.status}`}><CircleCheck size={14} /> {booking.status}</span>
                    <span>{booking.confirmation_code}</span>
                  </div>
                  <Link href={`/listings/${booking.listing_id}`}><h2>{booking.listing.title}</h2></Link>
                  <p><MapPin size={16} /> {booking.listing.location}</p>
                  <div className="trip-facts">
                    <span><CalendarDays size={17} /> {formatDate(booking.check_in)} – {formatDate(booking.check_out)}</span>
                    <span><UsersRound size={17} /> {booking.guests} guest{booking.guests === 1 ? "" : "s"}</span>
                  </div>
                  <div className="trip-footer">
                    <div><small>Total paid</small><strong>{formatCurrency(booking.total_price)}</strong></div>
                    {booking.status === "confirmed" && <button className="secondary-button" type="button" onClick={() => cancel(booking)}>Cancel booking</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
