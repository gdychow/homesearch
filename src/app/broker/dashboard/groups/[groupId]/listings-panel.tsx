import Link from "next/link";
import { db } from "@/lib/db";
import { matchListing } from "@/lib/matching";
import { MatchBadge, ListingSummary } from "@/app/_components/match-badge";

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
                  <Link
                    href={`/broker/dashboard/groups/${buyingGroupId}/listings/${listing.id}`}
                    className="hover:underline"
                  >
                    {listing.address}
                  </Link>
                </p>
                <ListingSummary listing={listing} />
                {interestedCount > 0 && (
                  <p className="mt-1 text-sm text-zinc-500">
                    {interestedCount} buyer{interestedCount === 1 ? "" : "s"} interested
                  </p>
                )}
              </div>
              <MatchBadge overall={result.overall} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
