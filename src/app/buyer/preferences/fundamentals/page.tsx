import Link from "next/link";
import type { Fundamental } from "@prisma/client";
import { requireBuyer } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { FUNDAMENTALS } from "@/lib/fundamentals";
import { FundamentalRanker } from "./fundamental-ranker";

export default async function FundamentalsPage() {
  const session = await requireBuyer();
  const existing = await db.buyerFundamentalRank.findMany({
    where: { buyerId: session.id },
    orderBy: { rank: "asc" },
  });

  const initialOrder: Fundamental[] =
    existing.length === FUNDAMENTALS.length
      ? existing.map((r) => r.fundamental)
      : FUNDAMENTALS.map((f) => f.key);

  return (
    <div className="mx-auto w-full max-w-xl flex-1 space-y-6 px-6 py-12">
      <div>
        <Link href="/buyer/dashboard" className="text-sm text-zinc-500 hover:underline">
          &larr; Dashboard
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-zinc-900">Rank what matters most</h1>
        <p className="text-sm text-zinc-500">
          These six qualities apply to every property you&rsquo;ll review. Only you and your broker can
          see your ranking.
        </p>
      </div>
      <FundamentalRanker initialOrder={initialOrder} />
    </div>
  );
}
