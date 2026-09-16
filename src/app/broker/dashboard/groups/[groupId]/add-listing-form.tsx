"use client";

import { useActionState } from "react";
import { addListing } from "@/lib/actions/listings";
import type { ActionState } from "@/lib/actions/broker";

const initialState: ActionState = {};

export function AddListingForm({ buyingGroupId }: { buyingGroupId: string }) {
  const [state, formAction, pending] = useActionState(addListing, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="buyingGroupId" value={buyingGroupId} />

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-sm font-medium text-zinc-700">
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field name="zip" label="Zip" />
        <Field name="beds" label="Beds" type="number" />
        <Field name="baths" label="Baths" type="number" />
        <Field name="sqft" label="Sqft" type="number" />
        <Field name="price" label="Price" type="number" />
        <Field name="url" label="Listing URL" type="url" />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add listing"}
      </button>
    </form>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        min={type === "number" ? 0 : undefined}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
