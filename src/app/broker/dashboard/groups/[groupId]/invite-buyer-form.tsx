"use client";

import { useActionState } from "react";
import { inviteBuyer, type ActionState } from "@/lib/actions/broker";

const initialState: ActionState = {};

export function InviteBuyerForm({ buyingGroupId }: { buyingGroupId: string }) {
  const [state, formAction, pending] = useActionState(inviteBuyer, initialState);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="buyingGroupId" value={buyingGroupId} />
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Buyer email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="buyer@example.com"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send invite"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
