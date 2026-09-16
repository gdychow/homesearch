import { db } from "@/lib/db";
import { AcceptInviteForm } from "./accept-invite-form";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = await db.invitation.findUnique({
    where: { token },
    include: { buyingGroup: true },
  });

  const isValid = invitation && invitation.status === "PENDING" && invitation.expiresAt > new Date();

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-8">
        {!isValid || !invitation ? (
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-zinc-900">Invitation not found</h1>
            <p className="text-sm text-zinc-500">
              This invitation link is invalid or has expired. Ask your broker to send a new one.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-zinc-900">
                Join &ldquo;{invitation.buyingGroup.name}&rdquo;
              </h1>
              <p className="text-sm text-zinc-500">Set a password to finish creating your account.</p>
            </div>
            <AcceptInviteForm token={token} email={invitation.email} />
          </>
        )}
      </div>
    </div>
  );
}
