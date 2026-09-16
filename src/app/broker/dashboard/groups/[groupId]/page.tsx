import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBroker } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { InviteBuyerForm } from "./invite-buyer-form";
import { PreferencesPanel } from "./preferences-panel";
import { CriteriaForm } from "./criteria-form";
import { AddListingForm } from "./add-listing-form";
import { ListingsPanel } from "./listings-panel";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const session = await requireBroker();
  const { groupId } = await params;

  const group = await db.buyingGroup.findFirst({
    where: { id: groupId, brokerId: session.id },
    include: {
      buyers: { orderBy: { createdAt: "asc" } },
      invitations: { orderBy: { createdAt: "desc" } },
      criteria: true,
    },
  });

  if (!group) notFound();

  const pendingInvitations = group.invitations.filter((i) => i.status === "PENDING");

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-12">
      <div>
        <Link href="/broker/dashboard" className="text-sm text-zinc-500 hover:underline">
          &larr; All buying groups
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-zinc-900">{group.name}</h1>
      </div>

      <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">Buyers</h2>
        {group.buyers.length === 0 ? (
          <p className="text-sm text-zinc-500">No buyers have joined yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {group.buyers.map((buyer) => (
              <li key={buyer.id} className="py-3">
                <p className="font-medium text-zinc-900">{buyer.name}</p>
                <p className="text-sm text-zinc-500">{buyer.email}</p>
              </li>
            ))}
          </ul>
        )}

        {pendingInvitations.length > 0 && (
          <div className="pt-2">
            <h3 className="text-sm font-medium text-zinc-700">Pending invitations</h3>
            <ul className="mt-1 space-y-1">
              {pendingInvitations.map((invite) => (
                <li key={invite.id} className="text-sm text-zinc-500">
                  {invite.email} &middot; expires {invite.expiresAt.toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Invite a buyer</h2>
        <InviteBuyerForm buyingGroupId={group.id} />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Search criteria</h2>
        <CriteriaForm buyingGroupId={group.id} existing={group.criteria} />
      </section>

      <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">Listings</h2>
        <ListingsPanel buyingGroupId={group.id} />
        <div className="border-t border-zinc-200 pt-4">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900">Add a listing</h3>
          <AddListingForm buyingGroupId={group.id} />
        </div>
      </section>

      <PreferencesPanel buyingGroupId={group.id} />
    </div>
  );
}
