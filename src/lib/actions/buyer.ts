"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { generateToken } from "@/lib/auth/token";
import { sendBuyerPasswordResetEmail } from "@/lib/email";
import type { ActionState } from "@/lib/actions/broker";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function loginBuyer(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;

  const buyer = await db.buyer.findUnique({ where: { email } });
  if (!buyer || !(await verifyPassword(password, buyer.passwordHash))) {
    return { error: "Invalid email or password" };
  }

  await createSessionCookie({ role: "buyer", id: buyer.id });
  redirect("/buyer/dashboard");
}

export async function logoutBuyer(): Promise<void> {
  await clearSessionCookie();
  redirect("/buyer/login");
}

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function acceptInvite(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = acceptInviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { token, name, password } = parsed.data;

  const invitation = await db.invitation.findUnique({ where: { token } });
  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
    return { error: "This invitation is invalid or has expired" };
  }

  const buyer = await db.$transaction(async (tx) => {
    const created = await tx.buyer.create({
      data: {
        buyingGroupId: invitation.buyingGroupId,
        email: invitation.email,
        name,
        passwordHash: await hashPassword(password),
      },
    });
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });
    return created;
  });

  await createSessionCookie({ role: "buyer", id: buyer.id });
  redirect("/buyer/dashboard");
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export interface RequestResetState extends ActionState {
  submitted?: boolean;
}

export async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const buyer = await db.buyer.findUnique({ where: { email: parsed.data.email } });
  // Always report success even if no account exists, so we don't leak which emails are registered.
  if (buyer) {
    const token = generateToken();
    await db.buyerPasswordResetToken.create({
      data: { buyerId: buyer.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    await sendBuyerPasswordResetEmail({ to: buyer.email, token });
  }

  return { submitted: true };
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetPassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { token, password } = parsed.data;

  const resetToken = await db.buyerPasswordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired" };
  }

  await db.$transaction([
    db.buyer.update({
      where: { id: resetToken.buyerId },
      data: { passwordHash: await hashPassword(password) },
    }),
    db.buyerPasswordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/buyer/login");
}
