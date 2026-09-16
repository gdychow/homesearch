"use client";

import { useActionState } from "react";
import { saveGroupCriteria } from "@/lib/actions/listings";
import type { ActionState } from "@/lib/actions/broker";
import type { GroupCriteria } from "@prisma/client";
import { parseAreas } from "@/lib/matching";

const initialState: ActionState = {};

function NumberField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: number | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        min={0}
        defaultValue={defaultValue ?? ""}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

export function CriteriaForm({
  buyingGroupId,
  existing,
}: {
  buyingGroupId: string;
  existing: GroupCriteria | null;
}) {
  const [state, formAction, pending] = useActionState(saveGroupCriteria, initialState);
  const zips = existing ? parseAreas(existing.areas).zips.join(", ") : "";
  const otherFeatures =
    existing?.otherFeatures && typeof existing.otherFeatures === "object" && "notes" in existing.otherFeatures
      ? String((existing.otherFeatures as { notes: unknown }).notes ?? "")
      : "";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="buyingGroupId" value={buyingGroupId} />

      <div className="flex flex-col gap-1">
        <label htmlFor="zips" className="text-sm font-medium text-zinc-700">
          Target zip codes (comma-separated)
        </label>
        <input
          id="zips"
          name="zips"
          type="text"
          placeholder="90210, 90211"
          defaultValue={zips}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <NumberField name="minBeds" label="Min bedrooms" defaultValue={existing?.minBeds} />
        <NumberField name="minBaths" label="Min bathrooms" defaultValue={existing?.minBaths} />
        <NumberField name="minSqft" label="Min sqft" defaultValue={existing?.minSqft} />
        <NumberField name="minPrice" label="Min price" defaultValue={existing?.minPrice} />
        <NumberField name="maxPrice" label="Max price" defaultValue={existing?.maxPrice} />
        <NumberField name="stretchMaxPrice" label="Stretch max price" defaultValue={existing?.stretchMaxPrice} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="otherFeatures" className="text-sm font-medium text-zinc-700">
          Other desired features
        </label>
        <textarea
          id="otherFeatures"
          name="otherFeatures"
          rows={2}
          defaultValue={otherFeatures}
          placeholder="e.g. pool, garage, single story"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save criteria"}
      </button>
    </form>
  );
}
