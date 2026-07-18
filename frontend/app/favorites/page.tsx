"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useCurrentUser, useToast } from "@/components/AppProviders";
import { Header } from "@/components/Header";
import { ListingGrid } from "@/components/ListingGrid";
import { EmptyState, LoadingState } from "@/components/StateViews";
import { api } from "@/lib/api";
import type { Favorite } from "@/lib/types";

export default function FavoritesPage() {
  const { user } = useCurrentUser();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setFavorites(await api.getFavorites(user.id));
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load wishlist", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, user.id]);

  useEffect(() => { void load(); }, [load]);
  const ids = useMemo(() => new Set(favorites.map((item) => item.listing_id)), [favorites]);

  const remove = async (listingId: number) => {
    try {
      await api.removeFavorite(user.id, listingId);
      setFavorites((current) => current.filter((item) => item.listing_id !== listingId));
      showToast("Removed from your wishlist", "info");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update wishlist", "error");
    }
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <div className="page-heading">
          <span className="eyebrow">Saved for later</span>
          <h1>Wishlists</h1>
          <p>Keep all the places you love in one simple collection.</p>
        </div>
        {loading ? <LoadingState label="Loading your wishlist…" /> : favorites.length === 0 ? (
          <EmptyState title="Your wishlist is empty" message="Tap the heart on any listing to save it here." />
        ) : (
          <ListingGrid listings={favorites.map((item) => item.listing)} favoriteIds={ids} onFavorite={remove} />
        )}
      </main>
    </>
  );
}
