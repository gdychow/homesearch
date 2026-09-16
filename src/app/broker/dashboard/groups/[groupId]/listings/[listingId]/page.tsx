import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBroker } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { matchListing } from "@/lib/matching";
import { MatchBadge, ListingSummary } from "@/app/_components/match-badge";
import { FeedbackEntry } from "@/app/_components/feedback-entry";

const INTEREST_LABELS = {
  INTERESTED: "Wants to visit",
  NOT_INTERESTED: "Not interested",
} as const;

export default async function BrokerListingDetailPage({
  params,
}: {
  params: Promise<{ groupId: string; listingId: string }>;
}) {
  const session = await requireBroker();
  const { groupId, listingId } = await params;

  const group = await db.buyingGroup.findFirst({ where: { id: groupId, brokerId: session.id } });
  if (!group) notFound();

  const groupListing = await db.groupListing.findFirst({
    where: { listingId, buyingGroupId: groupId },
    include: {
      listing: {
        include: { buyerInterests: { where: { buyer: { buyingGroupId: groupId } }, include: { buyer: true } } },
      },
    },
  });
  if (!groupListing) notFound();
  const { listing } = groupListing;

  const [criteria, feedbackEntries] = await Promise.all([
    db.groupCriteria.findUnique({ where: { buyingGroupId: groupId } }),
    db.propertyFeedback.findMany({
      where: { listingId, buyer: { buyingGroupId: groupId } },
      orderBy: [{ buyerId: "asc" }, { visitDate: "desc" }],
      include: {
        buyer: true,
        fundamentalScores: true,
        mustHaveScores: { include: { featureCatalog: true } },
      },
    }),
  ]);

  const result = matchListing(listing, criteria);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-6 py-12">
      <div>
        <Link href={`/broker/dashboard/groups/${groupId}`} className="text-sm text-zinc-500 hover:underline">
          &larr; {group.name}
        </Link>
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">{listing.address}</h1>
            <ListingSummary listing={listing} />
          </div>
          <MatchBadge overall={result.overall} />
        </div>
        {listing.url && (
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-500 hover:underline"
          >
            View original listing &#8599;
          </a>
        )}
        {listing.buyerInterests.length > 0 && (
          <ul className="text-sm text-zinc-600">
            {listing.buyerInterests.map((interest) => (
              <li key={interest.id}>
                {interest.buyer.name}: {INTEREST_LABELS[interest.status]}
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-900">Buyer feedback</h2>
        {feedbackEntries.length === 0 ? (
          <p className="text-sm text-zinc-500">No buyer has left feedback on this property yet.</p>
        ) : (
          feedbackEntries.map((entry) => (
            <FeedbackEntry key={entry.id} feedback={entry} heading={entry.buyer.name} />
          ))
        )}
      </section>
    </div>
  );
}
