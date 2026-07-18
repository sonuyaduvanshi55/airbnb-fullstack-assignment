"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/components/AppProviders";
import { Header } from "@/components/Header";
import { ListingForm } from "@/components/ListingForm";
import { LoadingState } from "@/components/StateViews";
import { api } from "@/lib/api";
import type { ListingDetail, ListingPayload } from "@/lib/types";

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const listingId = Number(params.id);
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setListing(await api.getListing(listingId));
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load listing", "error");
    } finally {
      setLoading(false);
    }
  }, [listingId, showToast]);

  useEffect(() => { void load(); }, [load]);

  const update = async (payload: ListingPayload) => {
    try {
      setSubmitting(true);
      await api.updateListing(listingId, 2, payload);
      showToast("Listing updated");
      router.push("/host");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update listing", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="page-shell narrow-shell">
        <div className="page-heading">
          <span className="eyebrow">Host editor</span>
          <h1>Edit listing</h1>
          <p>Update details while preserving the listing&apos;s existing bookings.</p>
        </div>
        {loading || !listing ? <LoadingState label="Loading listing editor…" /> : (
          <ListingForm hostId={2} initial={listing} submitting={submitting} onSubmit={update} />
        )}
      </main>
    </>
  );
}
