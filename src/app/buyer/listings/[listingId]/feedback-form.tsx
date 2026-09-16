"use client";

import { useActionState } from "react";
import { submitFeedback } from "@/lib/actions/feedback";
import type { ActionState } from "@/lib/actions/broker";
import { FUNDAMENTALS } from "@/lib/fundamentals";
import { StarRating } from "@/app/_components/star-rating";

const initialState: ActionState = {};

export function FeedbackForm({
  listingId,
  mustHaves,
}: {
  listingId: string;
  mustHaves: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(submitFeedback, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="listingId" value={listingId} />

      <div className="flex flex-col gap-1">
        <label htmlFor="visitDate" className="text-sm font-medium text-zinc-700">
          Visit date
        </label>
        <input
          id="visitDate"
          name="visitDate"
          type="date"
          defaultValue={today}
          className="w-fit rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-900">How did it score?</h3>
        {FUNDAMENTALS.map(({ key, label }) => (
          <StarRating key={key} name={`fundamental_${key}`} label={label} />
        ))}
      </div>

      {mustHaves.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-900">Your must-haves</h3>
          {mustHaves.map((feature) => (
            <StarRating key={feature.id} name={`musthave_${feature.id}`} label={feature.label} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-zinc-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="What stood out on this visit?"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save feedback"}
      </button>
    </form>
  );
}
