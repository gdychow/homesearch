import Link from "next/link";
import { requireBroker } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { logoutBroker } from "@/lib/actions/broker";
import { CreateGroupForm } from "./create-group-form";

export default async function BrokerDashboardPage() {
  const session = await requireBroker();
  const broker = await db.broker.findUniqueOrThrow({ where: { id: session.id } });
  const groups = await db.buyingGroup.findMany({
    where: { brokerId: session.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { buyers: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Welcome, {broker.name}</h1>
          <p className="text-sm text-zinc-500">{broker.email}</p>
        </div>
        <form action={logoutBroker}>
          <button type="submit" className="text-sm font-medium text-zinc-500 underline">
            Sign out
          </button>
        </form>
      </div>

      <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">Your buying groups</h2>
        {groups.length === 0 ? (
          <p className="text-sm text-zinc-500">No buying groups yet — create one below.</p>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {groups.map((group) => (
              <li key={group.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    href={`/broker/dashboard/groups/${group.id}`}
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {group.name}
                  </Link>
                  <p className="text-sm text-zinc-500">
                    {group._count.buyers} buyer{group._count.buyers === 1 ? "" : "s"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <CreateGroupForm />
      </section>
    </div>
  );
}
