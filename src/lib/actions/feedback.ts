"use server";

import { redirect } from "next/navigation";
import { requireBuyer } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { FUNDAMENTALS } from "@/lib/fundamentals";
import type { ActionState } from "@/lib/actions/broker";

export async function submitFeedback(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireBuyer();

  const listingId = formData.get("listingId");
  if (typeof listingId !== "string" || !listingId) {
    return { error: "Missing listing" };
  }

  const buyer = await db.buyer.findUniqueOrThrow({ where: { id: session.id } });
  const groupListing = await db.groupListing.findFirst({
    where: { listingId, buyingGroupId: buyer.buyingGroupId },
  });
  if (!groupListing) {
    return { error: "Listing not found" };
  }

  const visitDateRaw = formData.get("visitDate");
  const visitDate = typeof visitDateRaw === "string" && visitDateRaw ? new Date(visitDateRaw) : new Date();
  const notesRaw = formData.get("notes");
  const notes = typeof notesRaw === "string" && notesRaw.trim() ? notesRaw.trim() : null;

  const fundamentalScores = FUNDAMENTALS.map(({ key }) => {
    const raw = formData.get(`fundamental_${key}`);
    const stars = typeof raw === "string" ? Number(raw) : 0;
    return { fundamental: key, stars };
  }).filter((s) => s.stars >= 1 && s.stars <= 5);

  const mustHaveScores: { featureCatalogId: string; stars: number }[] = [];
  for (const [name, value] of formData.entries()) {
    if (name.startsWith("musthave_") && typeof value === "string") {
      const stars = Number(value);
      if (stars >= 1 && stars <= 5) {
        mustHaveScores.push({ featureCatalogId: name.slice("musthave_".length), stars });
      }
    }
  }

  if (fundamentalScores.length === 0 && mustHaveScores.length === 0 && !notes) {
    return { error: "Add at least one rating or a note before saving" };
  }

  await db.propertyFeedback.create({
    data: {
      buyerId: session.id,
      listingId,
      visitDate,
      notes,
      fundamentalScores: { create: fundamentalScores },
      mustHaveScores: { create: mustHaveScores },
    },
  });

  redirect(`/buyer/listings/${listingId}`);
}
