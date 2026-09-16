"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireBroker, requireBuyer } from "@/lib/auth/guards";
import type { ActionState } from "@/lib/actions/broker";
import type { ListingInterestStatus } from "@prisma/client";

const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().int().positive().optional(),
);

const criteriaSchema = z.object({
  buyingGroupId: z.string().min(1),
  zips: z.string().optional(),
  minBeds: optionalInt,
  minBaths: optionalInt,
  minSqft: optionalInt,
  minPrice: optionalInt,
  maxPrice: optionalInt,
  stretchMaxPrice: optionalInt,
  otherFeatures: z.string().optional(),
});

export async function saveGroupCriteria(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireBroker();
  const parsed = criteriaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { buyingGroupId, zips, otherFeatures, ...bounds } = parsed.data;

  const group = await db.buyingGroup.findFirst({ where: { id: buyingGroupId, brokerId: session.id } });
  if (!group) {
    return { error: "Buying group not found" };
  }

  const zipList = (zips ?? "")
    .split(",")
    .map((z) => z.trim())
    .filter(Boolean);

  await db.groupCriteria.upsert({
    where: { buyingGroupId },
    update: {
      areas: { zips: zipList },
      otherFeatures: otherFeatures ? { notes: otherFeatures } : undefined,
      ...bounds,
    },
    create: {
      buyingGroupId,
      areas: { zips: zipList },
      otherFeatures: otherFeatures ? { notes: otherFeatures } : undefined,
      ...bounds,
    },
  });

  redirect(`/broker/dashboard/groups/${buyingGroupId}`);
}

const addListingSchema = z.object({
  buyingGroupId: z.string().min(1),
  address: z.string().min(1, "Address is required"),
  zip: z.string().optional(),
  beds: optionalInt,
  baths: optionalInt,
  sqft: optionalInt,
  price: optionalInt,
  url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export async function addListing(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireBroker();
  const parsed = addListingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { buyingGroupId, address, zip, beds, baths, sqft, price, url } = parsed.data;

  const group = await db.buyingGroup.findFirst({ where: { id: buyingGroupId, brokerId: session.id } });
  if (!group) {
    return { error: "Buying group not found" };
  }

  const listing = await db.listing.create({
    data: {
      source: "MANUAL",
      address,
      zip: zip || undefined,
      beds,
      baths,
      sqft,
      price,
      url: url || undefined,
    },
  });

  await db.groupListing.create({
    data: { buyingGroupId, listingId: listing.id },
  });

  redirect(`/broker/dashboard/groups/${buyingGroupId}`);
}

export interface SaveInterestResult {
  error?: string;
  success?: boolean;
}

export async function saveListingInterest(
  listingId: string,
  status: ListingInterestStatus,
): Promise<SaveInterestResult> {
  const session = await requireBuyer();

  const buyer = await db.buyer.findUniqueOrThrow({ where: { id: session.id } });
  const groupListing = await db.groupListing.findFirst({
    where: { listingId, buyingGroupId: buyer.buyingGroupId },
  });
  if (!groupListing) {
    return { error: "Listing not found" };
  }

  await db.buyerListingInterest.upsert({
    where: { buyerId_listingId: { buyerId: session.id, listingId } },
    update: { status },
    create: { buyerId: session.id, listingId, status },
  });

  return { success: true };
}
