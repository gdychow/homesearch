import Link from "next/link";
import { requireBuyer } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { matchListing } from "@/lib/matching";
import { MatchBadge, ListingSummary } from "@/app/_components/match-badge";
import { InterestButtons } from "./interest-buttons";

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
                      <Link href={`/buyer/listings/${listing.id}`} className="hover:underline">
                        {listing.address}
                      </Link>
                    </p>
                    <ListingSummary listing={listing} />
                  </div>
                  <MatchBadge overall={result.overall} />
                </div>
                <div className="flex items-center justify-between">
                  <InterestButtons listingId={listing.id} initialStatus={myStatus} />
                  <Link
                    href={`/buyer/listings/${listing.id}`}
                    className="text-sm font-medium text-zinc-500 hover:underline"
                  >
                    Leave feedback
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
