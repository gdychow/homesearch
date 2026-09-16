import Link from "next/link";
import { requireBuyer } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { MustHaveRanker } from "./must-have-ranker";

export default async function MustHavesPage() {
  const session = await requireBuyer();

  const [allFeatures, existing] = await Promise.all([
    db.featureCatalog.findMany({ orderBy: [{ category: "asc" }, { label: "asc" }] }),
    db.buyerMustHave.findMany({
      where: { buyerId: session.id },
      orderBy: { rank: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-12">
      <div>
        <Link href="/buyer/dashboard" className="text-sm text-zinc-500 hover:underline">
          &larr; Dashboard
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-zinc-900">Choose your must-haves</h1>
        <p className="text-sm text-zinc-500">
          Only you and your broker can see this list — not the other buyers in your group.
        </p>
      </div>
      <MustHaveRanker
        allFeatures={allFeatures}
        initialRankedIds={existing.map((m) => m.featureCatalogId)}
      />
    </div>
  );
}
