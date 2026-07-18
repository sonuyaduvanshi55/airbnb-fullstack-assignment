"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCurrentUser, useToast } from "@/components/AppProviders";
import { Header } from "@/components/Header";
import { ListingForm } from "@/components/ListingForm";
import { api } from "@/lib/api";
import type { ListingPayload } from "@/lib/types";

export default function NewListingPage() {
  const router = useRouter();
  const { setRole } = useCurrentUser();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const create = async (payload: ListingPayload) => {
    try {
      setSubmitting(true);
      setRole("host");
      const listing = await api.createListing(payload);
      showToast("Listing published successfully");
      router.push(`/listings/${listing.id}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not publish listing", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="page-shell narrow-shell">
        <div className="page-heading">
          <span className="eyebrow">Host setup</span>
          <h1>Create a listing</h1>
          <p>Add photos, pricing, capacity, amenities, and location details.</p>
        </div>
        <ListingForm hostId={2} submitting={submitting} onSubmit={create} />
      </main>
    </>
  );
}
