import { db } from "@/lib/db";
import { FUNDAMENTALS } from "@/lib/fundamentals";

const DIVERGENCE_THRESHOLD = 3; // rank spread (out of 1-6) considered worth flagging

export async function PreferencesPanel({ buyingGroupId }: { buyingGroupId: string }) {
  const buyers = await db.buyer.findMany({
    where: { buyingGroupId },
    orderBy: { createdAt: "asc" },
    include: {
      mustHaves: { orderBy: { rank: "asc" }, include: { featureCatalog: true } },
      fundamentalRanks: true,
    },
  });

  if (buyers.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Buyer preferences</h2>
        <p className="text-sm text-zinc-500">
          Private per buyer &mdash; only visible to you. Rows highlighted in amber show the biggest
          disagreement within the group.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="py-2 pr-4 font-medium">Fundamental</th>
              {buyers.map((buyer) => (
                <th key={buyer.id} className="py-2 pr-4 font-medium">
                  {buyer.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FUNDAMENTALS.map(({ key, label }) => {
              const ranksByBuyer = buyers.map(
                (buyer) => buyer.fundamentalRanks.find((r) => r.fundamental === key)?.rank ?? null,
              );
              const setRanks = ranksByBuyer.filter((r): r is number => r !== null);
              const spread = setRanks.length >= 2 ? Math.max(...setRanks) - Math.min(...setRanks) : 0;
              const isDivergent = spread >= DIVERGENCE_THRESHOLD;

              return (
                <tr
                  key={key}
                  className={`border-b border-zinc-100 ${isDivergent ? "bg-amber-50" : ""}`}
                >
                  <td className="py-2 pr-4 font-medium text-zinc-900">
                    {label}
                    {isDivergent && (
                      <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        Tension
                      </span>
                    )}
                  </td>
                  {ranksByBuyer.map((rank, index) => (
                    <td key={buyers[index].id} className="py-2 pr-4 text-zinc-700">
                      {rank ?? <span className="text-zinc-300">&mdash;</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {buyers.map((buyer) => (
          <div key={buyer.id} className="rounded-md border border-zinc-200 p-4">
            <h3 className="text-sm font-semibold text-zinc-900">{buyer.name}&rsquo;s must-haves</h3>
            {buyer.mustHaves.length === 0 ? (
              <p className="mt-1 text-sm text-zinc-400">Not set up yet</p>
            ) : (
              <ol className="mt-2 space-y-1 text-sm text-zinc-700">
                {buyer.mustHaves.map((mustHave) => (
                  <li key={mustHave.id}>
                    {mustHave.rank}. {mustHave.featureCatalog.label}
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
