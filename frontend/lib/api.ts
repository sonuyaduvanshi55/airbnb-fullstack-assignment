import type {
  Availability,
  Booking,
  Favorite,
  ListingDetail,
  ListingFilters,
  ListingPayload,
  ListingSummary,
  PaginatedListings
} from "@/lib/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: string | Array<{ msg?: string }> };
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((item) => item.msg).filter(Boolean).join(", ");
    } catch {
      // Keep the HTTP fallback message.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function buildQuery(filters: ListingFilters): string {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null || rawValue === "") return;
    if (Array.isArray(rawValue)) {
      rawValue.forEach((value) => query.append(key, String(value)));
    } else {
      query.set(key, String(rawValue));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

export const api = {
  listListings: (filters: ListingFilters = {}) =>
    request<PaginatedListings>(`/listings${buildQuery(filters)}`),
  getListing: (id: number) => request<ListingDetail>(`/listings/${id}`),
  getAvailability: (id: number) => request<Availability>(`/listings/${id}/availability`),
  createBooking: (payload: {
    listing_id: number;
    guest_id: number;
    check_in: string;
    check_out: string;
    guests: number;
  }) => request<Booking>("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  getTrips: (userId: number) => request<Booking[]>(`/bookings/user/${userId}`),
  cancelBooking: (bookingId: number, userId: number) =>
    request<void>(`/bookings/${bookingId}?user_id=${userId}`, { method: "DELETE" }),
  getFavorites: (userId: number) => request<Favorite[]>(`/favorites/${userId}`),
  addFavorite: (userId: number, listingId: number) =>
    request<Favorite>("/favorites", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, listing_id: listingId })
    }),
  removeFavorite: (userId: number, listingId: number) =>
    request<void>(`/favorites/${userId}/${listingId}`, { method: "DELETE" }),
  getHostListings: (hostId: number) => request<ListingSummary[]>(`/host/${hostId}/listings`),
  getHostBookings: (hostId: number) => request<Booking[]>(`/host/${hostId}/bookings`),
  createListing: (payload: ListingPayload) =>
    request<ListingDetail>("/listings", { method: "POST", body: JSON.stringify(payload) }),
  updateListing: (listingId: number, hostId: number, payload: Partial<ListingPayload>) =>
    request<ListingDetail>(`/listings/${listingId}?host_id=${hostId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteListing: (listingId: number, hostId: number) =>
    request<void>(`/listings/${listingId}?host_id=${hostId}`, { method: "DELETE" })
};
