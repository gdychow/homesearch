"use client";

import { useState, useTransition } from "react";
import { saveListingInterest } from "@/lib/actions/listings";
import type { ListingInterestStatus } from "@prisma/client";

export function InterestButtons({
  listingId,
  initialStatus,
}: {
  listingId: string;
  initialStatus: ListingInterestStatus | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  function handleClick(next: ListingInterestStatus) {
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      const res = await saveListingInterest(listingId, next);
      if (res.error) setStatus(previous);
    });
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => handleClick("INTERESTED")}
        className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
          status === "INTERESTED"
            ? "bg-green-700 text-white"
            : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
        }`}
      >
        Want to visit
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => handleClick("NOT_INTERESTED")}
        className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
          status === "NOT_INTERESTED"
            ? "bg-zinc-700 text-white"
            : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
        }`}
      >
        Not interested
      </button>
    </div>
  );
}
