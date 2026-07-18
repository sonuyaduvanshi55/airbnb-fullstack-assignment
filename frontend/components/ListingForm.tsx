"use client";

import { FormEvent, useMemo, useState } from "react";

import { AMENITIES, PROPERTY_TYPES } from "@/lib/constants";
import type { ListingDetail, ListingPayload } from "@/lib/types";

const fallbackImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85"
];

export function ListingForm({
  hostId,
  initial,
  submitting,
  onSubmit
}: {
  hostId: number;
  initial?: ListingDetail;
  submitting: boolean;
  onSubmit: (payload: ListingPayload) => Promise<void>;
}) {
  const initialImages = useMemo(
    () => (initial?.images.length ? initial.images.map((image) => image.url).join("\n") : fallbackImages.join("\n")),
    [initial]
  );
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    location: initial?.location || "",
    country: initial?.country || "India",
    propertyType: initial?.property_type || "Villa",
    price: String(initial?.price_per_night || 5000),
    cleaningFee: String(initial?.cleaning_fee || 700),
    maxGuests: String(initial?.max_guests || 4),
    bedrooms: String(initial?.bedrooms || 2),
    beds: String(initial?.beds || 2),
    bathrooms: String(initial?.bathrooms || 2),
    latitude: initial?.latitude?.toString() || "",
    longitude: initial?.longitude?.toString() || "",
    instantBook: initial?.instant_book ?? true,
    imageUrls: initialImages,
    amenities: initial?.amenities.map((item) => item.name) || ["WiFi", "Kitchen"]
  });

  const toggleAmenity = (amenity: string) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity]
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const imageUrls = form.imageUrls
      .split(/\n|,/)
      .map((value) => value.trim())
      .filter(Boolean);

    await onSubmit({
      host_id: hostId,
      title: form.title,
      description: form.description,
      location: form.location,
      country: form.country,
      property_type: form.propertyType,
      price_per_night: Number(form.price),
      cleaning_fee: Number(form.cleaningFee),
      max_guests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      beds: Number(form.beds),
      bathrooms: Number(form.bathrooms),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      instant_book: form.instantBook,
      image_urls: imageUrls,
      amenity_names: form.amenities
    });
  };

  return (
    <form className="listing-form" onSubmit={submit}>
      <section className="form-card">
        <div className="form-section-heading">
          <span>1</span>
          <div>
            <h2>Describe your place</h2>
            <p>Give guests a clear, accurate overview.</p>
          </div>
        </div>
        <label>
          Listing title
          <input required minLength={5} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </label>
        <label>
          Description
          <textarea required minLength={20} rows={6} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <div className="form-grid two-columns">
          <label>
            City / location
            <input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          </label>
          <label>
            Country
            <input required value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} />
          </label>
        </div>
        <label>
          Property type
          <select value={form.propertyType} onChange={(event) => setForm({ ...form, propertyType: event.target.value })}>
            {PROPERTY_TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
      </section>

      <section className="form-card">
        <div className="form-section-heading">
          <span>2</span>
          <div>
            <h2>Capacity and pricing</h2>
            <p>Set occupancy details and the nightly price.</p>
          </div>
        </div>
        <div className="form-grid three-columns">
          <label>Guests<input type="number" min={1} required value={form.maxGuests} onChange={(event) => setForm({ ...form, maxGuests: event.target.value })} /></label>
          <label>Bedrooms<input type="number" min={0} required value={form.bedrooms} onChange={(event) => setForm({ ...form, bedrooms: event.target.value })} /></label>
          <label>Beds<input type="number" min={1} required value={form.beds} onChange={(event) => setForm({ ...form, beds: event.target.value })} /></label>
          <label>Bathrooms<input type="number" min={0.5} step={0.5} required value={form.bathrooms} onChange={(event) => setForm({ ...form, bathrooms: event.target.value })} /></label>
          <label>Price / night (₹)<input type="number" min={1} required value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
          <label>Cleaning fee (₹)<input type="number" min={0} required value={form.cleaningFee} onChange={(event) => setForm({ ...form, cleaningFee: event.target.value })} /></label>
        </div>
        <label className="checkbox-row large-checkbox">
          <input type="checkbox" checked={form.instantBook} onChange={(event) => setForm({ ...form, instantBook: event.target.checked })} />
          Enable instant booking
        </label>
      </section>

      <section className="form-card">
        <div className="form-section-heading">
          <span>3</span>
          <div>
            <h2>Photos and amenities</h2>
            <p>Use one public image URL per line.</p>
          </div>
        </div>
        <label>
          Image URLs
          <textarea required rows={6} value={form.imageUrls} onChange={(event) => setForm({ ...form, imageUrls: event.target.value })} />
        </label>
        <div className="checkbox-grid amenity-form-grid">
          {AMENITIES.map((amenity) => (
            <label key={amenity} className="checkbox-row">
              <input type="checkbox" checked={form.amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />
              {amenity}
            </label>
          ))}
        </div>
      </section>

      <section className="form-card">
        <div className="form-section-heading">
          <span>4</span>
          <div>
            <h2>Map coordinates (optional)</h2>
            <p>Used by a future interactive map integration.</p>
          </div>
        </div>
        <div className="form-grid two-columns">
          <label>Latitude<input type="number" step="any" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} /></label>
          <label>Longitude<input type="number" step="any" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} /></label>
        </div>
      </section>

      <button className="primary-button form-submit" type="submit" disabled={submitting}>
        {submitting ? "Saving…" : initial ? "Save changes" : "Publish listing"}
      </button>
    </form>
  );
}
