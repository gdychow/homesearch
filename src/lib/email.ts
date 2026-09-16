import { Resend } from "resend";

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "home-align <onboarding@resend.dev>";

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(apiKey);
}

function getAppUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export async function sendBuyerInviteEmail(params: {
  to: string;
  brokerName: string;
  buyingGroupName: string;
  token: string;
}) {
  const link = `${getAppUrl()}/invite/${params.token}`;
  await getClient().emails.send({
    from: FROM_ADDRESS,
    to: params.to,
    subject: `${params.brokerName} invited you to home-align`,
    html: `
      <p>${params.brokerName} has invited you to join the "${params.buyingGroupName}" buying group on home-align.</p>
      <p><a href="${link}">Accept your invitation</a> to set up your account.</p>
      <p>This link expires in 7 days.</p>
    `,
  });
}

export async function sendBuyerPasswordResetEmail(params: { to: string; token: string }) {
  const link = `${getAppUrl()}/buyer/reset-password/${params.token}`;
  await getClient().emails.send({
    from: FROM_ADDRESS,
    to: params.to,
    subject: "Reset your home-align password",
    html: `
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${link}">Reset password</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}
