import { db } from "@/lib/db";
import { matchListing, type MatchResult } from "@/lib/matching";

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

export async function ListingsPanel({ buyingGroupId }: { buyingGroupId: string }) {
  const [criteria, groupListings] = await Promise.all([
    db.groupCriteria.findUnique({ where: { buyingGroupId } }),
    db.groupListing.findMany({
      where: { buyingGroupId },
      orderBy: { addedAt: "desc" },
      include: {
        listing: {
          include: {
            buyerInterests: { where: { buyer: { buyingGroupId } } },
          },
        },
      },
    }),
  ]);

  if (groupListings.length === 0) {
    return <p className="text-sm text-zinc-500">No listings added yet.</p>;
  }

  return (
    <ul className="divide-y divide-zinc-200">
      {groupListings.map(({ listing }) => {
        const result = matchListing(listing, criteria);
        const interestedCount = listing.buyerInterests.filter((i) => i.status === "INTERESTED").length;

        return (
          <li key={listing.id} className="py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-zinc-900">
                  {listing.url ? (
                    <a href={listing.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {listing.address}
                    </a>
                  ) : (
                    listing.address
                  )}
                </p>
                <p className="text-sm text-zinc-500">
                  {[
                    listing.beds != null && `${listing.beds} bd`,
                    listing.baths != null && `${listing.baths} ba`,
                    listing.sqft != null && `${listing.sqft.toLocaleString()} sqft`,
                    listing.price != null && `$${listing.price.toLocaleString()}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {interestedCount > 0 && (
                  <p className="mt-1 text-sm text-zinc-500">
                    {interestedCount} buyer{interestedCount === 1 ? "" : "s"} interested
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${OVERALL_STYLES[result.overall]}`}
              >
                {OVERALL_LABELS[result.overall]}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
