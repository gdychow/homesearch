import type { MatchResult } from "@/lib/matching";

const OVERALL_STYLES: Record<MatchResult["overall"], string> = {
  meets: "bg-green-100 text-green-800",
  stretch: "bg-amber-100 text-amber-800",
  "below-criteria": "bg-red-100 text-red-800",
  unknown: "bg-zinc-100 text-zinc-600",
};

const OVERALL_LABELS: Record<MatchResult["overall"], string> = {
  meets: "Meets criteria",
  stretch: "Stretch price",
  "below-criteria": "Below criteria",
  unknown: "No criteria set",
};

export function MatchBadge({ overall }: { overall: MatchResult["overall"] }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${OVERALL_STYLES[overall]}`}>
      {OVERALL_LABELS[overall]}
    </span>
  );
}

export function ListingSummary({
  listing,
}: {
  listing: { beds: number | null; baths: number | null; sqft: number | null; price: number | null };
}) {
  const parts = [
    listing.beds != null && `${listing.beds} bd`,
    listing.baths != null && `${listing.baths} ba`,
    listing.sqft != null && `${listing.sqft.toLocaleString()} sqft`,
    listing.price != null && `$${listing.price.toLocaleString()}`,
  ].filter(Boolean);

  return <p className="text-sm text-zinc-500">{parts.join(" · ")}</p>;
}
