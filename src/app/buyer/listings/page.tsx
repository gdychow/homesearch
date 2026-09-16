import Link from "next/link";
import { requireBuyer } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { matchListing, type MatchResult } from "@/lib/matching";
import { InterestButtons } from "./interest-buttons";

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

export default async function BuyerListingsPage() {
  const session = await requireBuyer();
  const buyer = await db.buyer.findUniqueOrThrow({ where: { id: session.id } });

  const [criteria, groupListings] = await Promise.all([
    db.groupCriteria.findUnique({ where: { buyingGroupId: buyer.buyingGroupId } }),
    db.groupListing.findMany({
      where: { buyingGroupId: buyer.buyingGroupId },
      orderBy: { addedAt: "desc" },
      include: {
        listing: {
          include: { buyerInterests: { where: { buyerId: session.id } } },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-6 py-12">
      <div>
        <Link href="/buyer/dashboard" className="text-sm text-zinc-500 hover:underline">
          &larr; Dashboard
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-zinc-900">Properties</h1>
      </div>

      {groupListings.length === 0 ? (
        <p className="text-sm text-zinc-500">Your broker hasn&rsquo;t added any properties yet.</p>
      ) : (
        <ul className="space-y-4">
          {groupListings.map(({ listing }) => {
            const result = matchListing(listing, criteria);
            const myStatus = listing.buyerInterests[0]?.status ?? null;

            return (
              <li key={listing.id} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-5">
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
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${OVERALL_STYLES[result.overall]}`}
                  >
                    {OVERALL_LABELS[result.overall]}
                  </span>
                </div>
                <InterestButtons listingId={listing.id} initialStatus={myStatus} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
