"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useCurrentUser, useToast } from "@/components/AppProviders";
import { CategoryFilters, type AdvancedFilters } from "@/components/CategoryFilters";
import { Header } from "@/components/Header";
import { ListingGrid } from "@/components/ListingGrid";
import { SearchBar, type SearchValues } from "@/components/SearchBar";
import { EmptyState, LoadingState } from "@/components/StateViews";
import { api } from "@/lib/api";
import type { ListingFilters, ListingSummary } from "@/lib/types";

const initialSearch: SearchValues = { location: "", checkIn: "", checkOut: "", guests: 1 };
const initialAdvanced: AdvancedFilters = { minPrice: "", maxPrice: "", propertyType: "", amenities: [] };

export default function HomePage() {
  const { user } = useCurrentUser();
  const { showToast } = useToast();
  const [search, setSearch] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [advanced, setAdvanced] = useState(initialAdvanced);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const filters = useMemo<ListingFilters>(() => ({
    location: appliedSearch.location || undefined,
    check_in: appliedSearch.checkIn || undefined,
    check_out: appliedSearch.checkOut || undefined,
    guests: appliedSearch.guests || undefined,
    min_price: advanced.minPrice ? Number(advanced.minPrice) : undefined,
    max_price: advanced.maxPrice ? Number(advanced.maxPrice) : undefined,
    property_type: advanced.propertyType || undefined,
    amenities: advanced.amenities,
    page,
    page_size: 8
  }), [advanced, appliedSearch, page]);

  const loadListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.listListings(filters);
      setListings(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load stays", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await api.getFavorites(user.id);
      setFavoriteIds(new Set(favorites.map((favorite) => favorite.listing_id)));
    } catch {
      setFavoriteIds(new Set());
    }
  }, [user.id]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (listingId: number) => {
    const currentlyFavorite = favoriteIds.has(listingId);
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (currentlyFavorite) next.delete(listingId);
      else next.add(listingId);
      return next;
    });
    try {
      if (currentlyFavorite) {
        await api.removeFavorite(user.id, listingId);
        showToast("Removed from your wishlist", "info");
      } else {
        await api.addFavorite(user.id, listingId);
        showToast("Saved to your wishlist");
      }
    } catch (error) {
      await loadFavorites();
      showToast(error instanceof Error ? error.message : "Could not update wishlist", "error");
    }
  };

  const resetAll = () => {
    setSearch(initialSearch);
    setAppliedSearch(initialSearch);
    setAdvanced(initialAdvanced);
    setPage(1);
  };

  return (
    <>
      <Header />
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Made for memorable stays</span>
            <h1>Find a place that feels like yours.</h1>
            <p>Explore photo-forward homes, transparent pricing, and simple end-to-end booking.</p>
          </div>
          <SearchBar
            values={search}
            onChange={setSearch}
            onSubmit={() => {
              if ((search.checkIn && !search.checkOut) || (!search.checkIn && search.checkOut)) {
                showToast("Choose both check-in and check-out dates", "error");
                return;
              }
              setAppliedSearch(search);
              setPage(1);
            }}
          />
        </section>

        <div className="content-shell">
          <CategoryFilters
            selectedPropertyType={advanced.propertyType}
            selectedAmenities={advanced.amenities}
            filters={advanced}
            onCategory={(propertyType, amenity) => {
              setPage(1);
              setAdvanced((current) => ({
                ...current,
                propertyType: propertyType ? (current.propertyType === propertyType ? "" : propertyType) : current.propertyType,
                amenities: amenity
                  ? current.amenities.includes(amenity)
                    ? current.amenities.filter((item) => item !== amenity)
                    : [...current.amenities, amenity]
                  : current.amenities
              }));
            }}
            onApply={(next) => {
              setAdvanced(next);
              setPage(1);
            }}
            onClear={() => {
              setAdvanced(initialAdvanced);
              setPage(1);
            }}
          />

          <div className="results-heading">
            <div>
              <h2>{appliedSearch.location ? `Stays near ${appliedSearch.location}` : "Explore stays across India"}</h2>
              <p>{total} places · Prices shown before booking confirmation</p>
            </div>
            {(appliedSearch.location || appliedSearch.checkIn || advanced.propertyType || advanced.amenities.length > 0 || advanced.minPrice || advanced.maxPrice) && (
              <button className="secondary-button" type="button" onClick={resetAll}>
                <RotateCcw size={16} /> Reset
              </button>
            )}
          </div>

          {loading ? (
            <LoadingState />
          ) : listings.length === 0 ? (
            <EmptyState title="No exact matches" message="Try changing the destination, dates, price range, or amenities." />
          ) : (
            <ListingGrid listings={listings} favoriteIds={favoriteIds} onFavorite={toggleFavorite} />
          )}

          {!loading && totalPages > 1 && (
            <div className="pagination">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                <ChevronLeft size={18} />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
