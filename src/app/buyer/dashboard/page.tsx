import Link from "next/link";
import { requireBuyer } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { FUNDAMENTALS } from "@/lib/fundamentals";
import { logoutBuyer } from "@/lib/actions/buyer";

export default async function BuyerDashboardPage() {
  const session = await requireBuyer();
  const buyer = await db.buyer.findUniqueOrThrow({
    where: { id: session.id },
    include: { buyingGroup: true },
  });

  const [mustHaveCount, fundamentalCount, totalListings, interests] = await Promise.all([
    db.buyerMustHave.count({ where: { buyerId: session.id } }),
    db.buyerFundamentalRank.count({ where: { buyerId: session.id } }),
    db.groupListing.count({ where: { buyingGroupId: buyer.buyingGroupId } }),
    db.buyerListingInterest.findMany({ where: { buyerId: session.id }, select: { status: true } }),
  ]);

  const mustHavesDone = mustHaveCount >= 5;
  const fundamentalsDone = fundamentalCount === FUNDAMENTALS.length;
  const reviewedCount = interests.length;
  const toReviewCount = Math.max(totalListings - reviewedCount, 0);
  const wantToVisitCount = interests.filter((i) => i.status === "INTERESTED").length;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Welcome, {buyer.name}</h1>
          <p className="text-sm text-zinc-500">
            You&rsquo;re part of &ldquo;{buyer.buyingGroup.name}&rdquo;
          </p>
        </div>
        <form action={logoutBuyer}>
          <button type="submit" className="text-sm font-medium text-zinc-500 underline">
            Sign out
          </button>
        </form>
      </div>

      <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">Your preferences</h2>
        <PreferenceRow
          href="/buyer/preferences/must-haves"
          label="Must-have features"
          done={mustHavesDone}
          detail={mustHavesDone ? `${mustHaveCount} selected` : "Not set up yet"}
        />
        <PreferenceRow
          href="/buyer/preferences/fundamentals"
          label="What matters most"
          done={fundamentalsDone}
          detail={fundamentalsDone ? "Ranked" : "Not ranked yet"}
        />
      </section>

      <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">Properties</h2>
        <Link
          href="/buyer/listings"
          className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-3 hover:bg-zinc-50"
        >
          <div className="flex gap-6">
            <Stat label="To review" value={toReviewCount} />
            <Stat label="Want to visit" value={wantToVisitCount} />
          </div>
          <span className="text-xs font-medium text-zinc-400">View all</span>
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-semibold text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function PreferenceRow({
  href,
  label,
  done,
  detail,
}: {
  href: string;
  label: string;
  done: boolean;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-3 hover:bg-zinc-50"
    >
      <div>
        <p className="font-medium text-zinc-900">{label}</p>
        <p className="text-sm text-zinc-500">{detail}</p>
      </div>
      <span
        className={`text-xs font-medium ${done ? "text-green-700" : "text-zinc-400"}`}
      >
        {done ? "Done" : "Start"}
      </span>
    </Link>
  );
}
