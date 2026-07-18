"use client";

import { CalendarCheck2, IndianRupee, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useCurrentUser, useToast } from "@/components/AppProviders";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/StateViews";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking, ListingSummary } from "@/lib/types";

export default function HostDashboardPage() {
  const { user, setRole } = useCurrentUser();
  const { showToast } = useToast();
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"listings" | "bookings">("listings");
  const [loading, setLoading] = useState(true);

  const hostId = 2;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [owned, reservations] = await Promise.all([api.getHostListings(hostId), api.getHostBookings(hostId)]);
      setListings(owned);
      setBookings(reservations);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load host dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void load(); }, [load]);

  const projectedRevenue = useMemo(
    () => bookings.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + item.total_price, 0),
    [bookings]
  );

  const removeListing = async (listing: ListingSummary) => {
    if (!window.confirm(`Delete “${listing.title}”? This also removes its booking history.`)) return;
    try {
      await api.deleteListing(listing.id, hostId);
      showToast("Listing deleted", "info");
      await load();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete listing", "error");
    }
  };

  return (
    <>
      <Header />
      <main className="page-shell host-shell">
        <div className="host-hero">
          <div>
            <span className="eyebrow">Host workspace</span>
            <h1>Welcome back, Maya.</h1>
            <p>Manage listings, review reservations, and track booking value.</p>
          </div>
          <Link className="primary-button" href="/host/new"><Plus size={18} /> Create listing</Link>
        </div>

        {user.role !== "host" && (
          <div className="role-notice">
            <div><strong>You are viewing the host demo as a guest.</strong><span>Switch role to unlock the host navigation state.</span></div>
            <button className="secondary-button" type="button" onClick={() => setRole("host")}>Switch to host</button>
          </div>
        )}

        <section className="stats-grid">
          <article><span><CalendarCheck2 size={20} /></span><div><small>Confirmed bookings</small><strong>{bookings.filter((item) => item.status === "confirmed").length}</strong></div></article>
          <article><span><IndianRupee size={20} /></span><div><small>Booking value</small><strong>{formatCurrency(projectedRevenue)}</strong></div></article>
          <article><span><UsersRound size={20} /></span><div><small>Active listings</small><strong>{listings.length}</strong></div></article>
        </section>

        <div className="dashboard-tabs">
          <button type="button" className={tab === "listings" ? "active" : ""} onClick={() => setTab("listings")}>Your listings</button>
          <button type="button" className={tab === "bookings" ? "active" : ""} onClick={() => setTab("bookings")}>Reservations</button>
        </div>

        {loading ? <LoadingState label="Loading host data…" /> : tab === "listings" ? (
          <div className="host-listing-table">
            {listings.map((listing) => (
              <article key={listing.id} className="host-listing-row">
                <img src={listing.cover_image} alt={listing.title} />
                <div className="host-listing-info">
                  <Link href={`/listings/${listing.id}`}><h3>{listing.title}</h3></Link>
                  <p>{listing.location} · {listing.property_type}</p>
                  <strong>{formatCurrency(listing.price_per_night)} / night</strong>
                </div>
                <div className="host-row-actions">
                  <Link href={`/host/listings/${listing.id}/edit`} className="icon-text-button"><Pencil size={16} /> Edit</Link>
                  <button type="button" className="icon-text-button danger" onClick={() => removeListing(listing)}><Trash2 size={16} /> Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="reservation-table-wrap">
            <table className="reservation-table">
              <thead><tr><th>Guest</th><th>Listing</th><th>Dates</th><th>Status</th><th>Total</th></tr></thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.guest.name}</strong><span>{booking.guests} guest{booking.guests === 1 ? "" : "s"}</span></td>
                    <td>{booking.listing.title}</td>
                    <td>{formatDate(booking.check_in)} – {formatDate(booking.check_out)}</td>
                    <td><span className={`status-badge status-${booking.status}`}>{booking.status}</span></td>
                    <td><strong>{formatCurrency(booking.total_price)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
