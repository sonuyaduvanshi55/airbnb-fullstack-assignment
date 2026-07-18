import type { ListingSummary } from "@/lib/types";

import { ListingCard } from "@/components/ListingCard";

export function ListingGrid({
  listings,
  favoriteIds,
  onFavorite
}: {
  listings: ListingSummary[];
  favoriteIds: Set<number>;
  onFavorite: (listingId: number) => void;
}) {
  return (
    <div className="listing-grid">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          favorite={favoriteIds.has(listing.id)}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
}
