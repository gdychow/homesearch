import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBuyer } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { matchListing } from "@/lib/matching";
import { MatchBadge, ListingSummary } from "@/app/_components/match-badge";
import { FeedbackEntry } from "@/app/_components/feedback-entry";
import { InterestButtons } from "../interest-buttons";
import { FeedbackForm } from "./feedback-form";

export default async function BuyerListingDetailPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const session = await requireBuyer();
  const { listingId } = await params;
  const buyer = await db.buyer.findUniqueOrThrow({ where: { id: session.id } });

  const groupListing = await db.groupListing.findFirst({
    where: { listingId, buyingGroupId: buyer.buyingGroupId },
    include: { listing: { include: { buyerInterests: { where: { buyerId: session.id } } } } },
  });
  if (!groupListing) notFound();
  const { listing } = groupListing;

  const [criteria, mustHaves, feedbackEntries] = await Promise.all([
    db.groupCriteria.findUnique({ where: { buyingGroupId: buyer.buyingGroupId } }),
    db.buyerMustHave.findMany({
      where: { buyerId: session.id },
      orderBy: { rank: "asc" },
      include: { featureCatalog: true },
    }),
    db.propertyFeedback.findMany({
      where: { buyerId: session.id, listingId },
      orderBy: { visitDate: "desc" },
      include: {
        fundamentalScores: true,
        mustHaveScores: { include: { featureCatalog: true } },
      },
    }),
  ]);

  const result = matchListing(listing, criteria);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-6 py-12">
      <div>
        <Link href="/buyer/listings" className="text-sm text-zinc-500 hover:underline">
          &larr; Properties
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
        <InterestButtons listingId={listing.id} initialStatus={listing.buyerInterests[0]?.status ?? null} />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Leave feedback</h2>
        <FeedbackForm
          listingId={listing.id}
          mustHaves={mustHaves.map((m) => ({ id: m.featureCatalogId, label: m.featureCatalog.label }))}
        />
      </section>

      {feedbackEntries.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-zinc-900">Your past feedback</h2>
          {feedbackEntries.map((entry) => (
            <FeedbackEntry key={entry.id} feedback={entry} />
          ))}
        </section>
      )}
    </div>
  );
}
