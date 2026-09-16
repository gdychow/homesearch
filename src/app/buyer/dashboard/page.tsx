import { requireBuyer } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { logoutBuyer } from "@/lib/actions/buyer";

export default async function BuyerDashboardPage() {
  const session = await requireBuyer();
  const buyer = await db.buyer.findUniqueOrThrow({
    where: { id: session.id },
    include: { buyingGroup: true },
  });

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
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        Preference ranking (must-haves and fundamentals) is coming next.
      </div>
    </div>
  );
}
