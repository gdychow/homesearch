import type { GroupCriteria, Listing } from "@prisma/client";

export type CriteriaAreas = { zips: string[] };

export function parseAreas(areas: unknown): CriteriaAreas {
  if (areas && typeof areas === "object" && Array.isArray((areas as CriteriaAreas).zips)) {
    return { zips: (areas as CriteriaAreas).zips };
  }
  return { zips: [] };
}

export type CheckStatus = "pass" | "fail" | "stretch" | "unknown";

export interface CriteriaCheck {
  label: string;
  status: CheckStatus;
}

export interface MatchResult {
  overall: "meets" | "stretch" | "below-criteria" | "unknown";
  checks: CriteriaCheck[];
}

function atLeast(value: number | null, min: number | null | undefined, label: string): CriteriaCheck {
  if (min == null) return { label, status: "unknown" };
  if (value == null) return { label, status: "unknown" };
  return { label, status: value >= min ? "pass" : "fail" };
}

export function matchListing(listing: Listing, criteria: GroupCriteria | null): MatchResult {
  if (!criteria) {
    return { overall: "unknown", checks: [] };
  }

  const checks: CriteriaCheck[] = [
    atLeast(listing.beds, criteria.minBeds, "Beds"),
    atLeast(listing.baths, criteria.minBaths, "Baths"),
    atLeast(listing.sqft, criteria.minSqft, "Sqft"),
  ];

  const { zips } = parseAreas(criteria.areas);
  if (zips.length > 0) {
    checks.push({
      label: "Area",
      status: listing.zip ? (zips.includes(listing.zip) ? "pass" : "fail") : "unknown",
    });
  }

  let priceCheck: CriteriaCheck = { label: "Price", status: "unknown" };
  if (listing.price != null) {
    const { minPrice, maxPrice, stretchMaxPrice } = criteria;
    if (minPrice != null && listing.price < minPrice) {
      priceCheck = { label: "Price", status: "fail" };
    } else if (maxPrice != null && listing.price > maxPrice) {
      if (stretchMaxPrice != null && listing.price <= stretchMaxPrice) {
        priceCheck = { label: "Price", status: "stretch" };
      } else {
        priceCheck = { label: "Price", status: "fail" };
      }
    } else if (minPrice != null || maxPrice != null) {
      priceCheck = { label: "Price", status: "pass" };
    }
  }
  checks.push(priceCheck);

  const hasFail = checks.some((c) => c.status === "fail");
  const hasStretch = checks.some((c) => c.status === "stretch");
  const hasKnown = checks.some((c) => c.status !== "unknown");

  const overall: MatchResult["overall"] = hasFail
    ? "below-criteria"
    : hasStretch
      ? "stretch"
      : hasKnown
        ? "meets"
        : "unknown";

  return { overall, checks };
}
