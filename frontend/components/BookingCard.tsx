"use client";

import { CreditCard, LockKeyhole, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useToast } from "@/components/AppProviders";
import { api } from "@/lib/api";
import { formatCurrency, nightsBetween, todayIso } from "@/lib/format";
import type { Availability, ListingDetail } from "@/lib/types";

export function BookingCard({
  listing,
  availability,
  guestId
}: {
  listing: ListingDetail;
  availability: Availability | null;
  guestId: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nights = nightsBetween(checkIn, checkOut);
  const breakdown = useMemo(() => {
    const nightlyTotal = listing.price_per_night * nights;
    const serviceFee = nightlyTotal * 0.12;
    const taxes = (nightlyTotal + listing.cleaning_fee + serviceFee) * 0.08;
    return {
      nightlyTotal,
      serviceFee,
      taxes,
      total: nightlyTotal + listing.cleaning_fee + serviceFee + taxes
    };
  }, [listing.cleaning_fee, listing.price_per_night, nights]);

  const validate = () => {
    if (!checkIn || !checkOut) throw new Error("Select check-in and check-out dates");
    if (nights < 1) throw new Error("Check-out must be after check-in");
    if (guests > listing.max_guests) throw new Error(`This home allows up to ${listing.max_guests} guests`);
  };

  const startCheckout = () => {
    try {
      validate();
      setCheckoutOpen(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Please check your booking details", "error");
    }
  };

  const confirmBooking = async () => {
    try {
      validate();
      setSubmitting(true);
      await api.createBooking({
        listing_id: listing.id,
        guest_id: guestId,
        check_in: checkIn,
        check_out: checkOut,
        guests
      });
      showToast("Booking confirmed. Your trip is ready!", "success");
      setCheckoutOpen(false);
      router.push("/trips?booked=1");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Booking could not be completed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <aside className="booking-card">
        <div className="booking-card-heading">
          <div>
            <strong>{formatCurrency(listing.price_per_night)}</strong>
            <span> night</span>
          </div>
          <span className="booking-rating">
            <Star size={14} fill="currentColor" /> {listing.rating} · {listing.review_count} reviews
          </span>
        </div>

        <div className="booking-input-box">
          <label>
            <span>CHECK-IN</span>
            <input type="date" min={todayIso()} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
          </label>
          <label>
            <span>CHECKOUT</span>
            <input type="date" min={checkIn || todayIso()} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
          </label>
          <label className="booking-guests">
            <span>GUESTS</span>
            <select value={guests} onChange={(event) => setGuests(Number(event.target.value))}>
              {Array.from({ length: listing.max_guests }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>
                  {count} guest{count === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button className="reserve-button" type="button" onClick={startCheckout}>
          Reserve
        </button>
        <p className="charge-note">You won&apos;t be charged yet</p>

        {nights > 0 && (
          <div className="price-breakdown">
            <div>
              <span>{formatCurrency(listing.price_per_night)} × {nights} nights</span>
              <span>{formatCurrency(breakdown.nightlyTotal)}</span>
            </div>
            <div>
              <span>Cleaning fee</span>
              <span>{formatCurrency(listing.cleaning_fee)}</span>
            </div>
            <div>
              <span>Staybnb service fee</span>
              <span>{formatCurrency(breakdown.serviceFee)}</span>
            </div>
            <div>
              <span>Taxes</span>
              <span>{formatCurrency(breakdown.taxes)}</span>
            </div>
            <div className="price-total">
              <strong>Total</strong>
              <strong>{formatCurrency(breakdown.total)}</strong>
            </div>
          </div>
        )}

        {availability && availability.unavailable_ranges.length > 0 && (
          <div className="unavailable-note">
            <strong>Unavailable dates</strong>
            <div>
              {availability.unavailable_ranges.slice(0, 3).map((range) => (
                <span key={`${range.check_in}-${range.check_out}`}>
                  {range.check_in} → {range.check_out}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>

      {checkoutOpen && (
        <div className="modal-backdrop" onMouseDown={() => setCheckoutOpen(false)}>
          <section className="checkout-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <button className="icon-button" type="button" onClick={() => setCheckoutOpen(false)}>
                <X size={20} />
              </button>
              <h2>Confirm and pay</h2>
              <span />
            </div>

            <div className="checkout-content">
              <div className="checkout-summary-card">
                <img src={listing.cover_image} alt={listing.title} />
                <div>
                  <small>{listing.property_type}</small>
                  <strong>{listing.title}</strong>
                  <span>{checkIn} → {checkOut} · {guests} guest{guests === 1 ? "" : "s"}</span>
                </div>
              </div>

              <div className="payment-box">
                <div className="payment-heading">
                  <h3>Pay with</h3>
                  <CreditCard size={22} />
                </div>
                <label>
                  Card number
                  <input defaultValue="4242 4242 4242 4242" aria-label="Mock card number" />
                </label>
                <div className="payment-row">
                  <label>
                    Expiration
                    <input defaultValue="12/30" aria-label="Mock expiration date" />
                  </label>
                  <label>
                    CVV
                    <input defaultValue="123" aria-label="Mock CVV" />
                  </label>
                </div>
                <p><LockKeyhole size={15} /> This is a mocked checkout. No real payment is processed.</p>
              </div>

              <div className="checkout-total">
                <span>Total (INR)</span>
                <strong>{formatCurrency(breakdown.total)}</strong>
              </div>
              <button className="reserve-button" type="button" disabled={submitting} onClick={confirmBooking}>
                {submitting ? "Confirming…" : "Confirm booking"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
