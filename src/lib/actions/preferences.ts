"use server";

import { z } from "zod";
import type { Fundamental } from "@prisma/client";
import { db } from "@/lib/db";
import { requireBuyer } from "@/lib/auth/guards";
import { FUNDAMENTALS } from "@/lib/fundamentals";

export interface SaveResult {
  error?: string;
  success?: boolean;
}

const mustHavesSchema = z.array(z.string().min(1)).min(5, "Pick at least 5 must-haves").max(10, "Pick at most 10 must-haves");

export async function saveMustHaves(orderedFeatureIds: string[]): Promise<SaveResult> {
  const session = await requireBuyer();
  const parsed = mustHavesSchema.safeParse(orderedFeatureIds);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const featureIds = parsed.data;

  const validCount = await db.featureCatalog.count({ where: { id: { in: featureIds } } });
  if (validCount !== featureIds.length) {
    return { error: "One or more selected features are no longer available" };
  }

  await db.$transaction([
    db.buyerMustHave.deleteMany({ where: { buyerId: session.id } }),
    db.buyerMustHave.createMany({
      data: featureIds.map((featureCatalogId, index) => ({
        buyerId: session.id,
        featureCatalogId,
        rank: index + 1,
      })),
    }),
  ]);

  return { success: true };
}

const VALID_FUNDAMENTALS = new Set(FUNDAMENTALS.map((f) => f.key));

export async function saveFundamentalRanks(orderedFundamentals: Fundamental[]): Promise<SaveResult> {
  const session = await requireBuyer();

  const isValidSet =
    orderedFundamentals.length === FUNDAMENTALS.length &&
    new Set(orderedFundamentals).size === FUNDAMENTALS.length &&
    orderedFundamentals.every((f) => VALID_FUNDAMENTALS.has(f));

  if (!isValidSet) {
    return { error: "All six fundamentals must be ranked exactly once" };
  }

  await db.$transaction([
    db.buyerFundamentalRank.deleteMany({ where: { buyerId: session.id } }),
    db.buyerFundamentalRank.createMany({
      data: orderedFundamentals.map((fundamental, index) => ({
        buyerId: session.id,
        fundamental,
        rank: index + 1,
      })),
    }),
  ]);

  return { success: true };
}
