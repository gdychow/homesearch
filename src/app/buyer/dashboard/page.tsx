import Link from "next/link";
import { requireBuyer } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { FUNDAMENTALS } from "@/lib/fundamentals";
import { logoutBuyer } from "@/lib/actions/buyer";

export default async function BuyerDashboardPage() {
  const session = await requireBuyer();
  const [buyer, mustHaveCount, fundamentalCount] = await Promise.all([
    db.buyer.findUniqueOrThrow({ where: { id: session.id }, include: { buyingGroup: true } }),
    db.buyerMustHave.count({ where: { buyerId: session.id } }),
    db.buyerFundamentalRank.count({ where: { buyerId: session.id } }),
  ]);

  const mustHavesDone = mustHaveCount >= 5;
  const fundamentalsDone = fundamentalCount === FUNDAMENTALS.length;

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

      <section className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        Property browsing and visit feedback are coming in a later update.
      </section>
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
