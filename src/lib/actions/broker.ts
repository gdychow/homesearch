"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { requireBroker } from "@/lib/auth/guards";
import { generateToken } from "@/lib/auth/token";
import { sendBuyerInviteEmail } from "@/lib/email";

export interface ActionState {
  error?: string;
}

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signupBroker(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password } = parsed.data;

  const existing = await db.broker.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists" };
  }

  const broker = await db.broker.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });

  await createSessionCookie({ role: "broker", id: broker.id });
  redirect("/broker/dashboard");
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function loginBroker(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;

  const broker = await db.broker.findUnique({ where: { email } });
  if (!broker || !(await verifyPassword(password, broker.passwordHash))) {
    return { error: "Invalid email or password" };
  }

  await createSessionCookie({ role: "broker", id: broker.id });
  redirect("/broker/dashboard");
}

export async function logoutBroker(): Promise<void> {
  await clearSessionCookie();
  redirect("/broker/login");
}

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});

export async function createGroup(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireBroker();
  const parsed = createGroupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.buyingGroup.create({
    data: { name: parsed.data.name, brokerId: session.id },
  });
  redirect("/broker/dashboard");
}

const inviteBuyerSchema = z.object({
  buyingGroupId: z.string().min(1),
  email: z.string().email("Enter a valid email"),
});

export async function inviteBuyer(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireBroker();
  const parsed = inviteBuyerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { buyingGroupId, email } = parsed.data;

  const group = await db.buyingGroup.findFirst({
    where: { id: buyingGroupId, brokerId: session.id },
  });
  if (!group) {
    return { error: "Buying group not found" };
  }

  const existingBuyer = await db.buyer.findUnique({ where: { email } });
  if (existingBuyer) {
    return { error: "A buyer with that email already exists" };
  }

  const broker = await db.broker.findUniqueOrThrow({ where: { id: session.id } });
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    await sendBuyerInviteEmail({
      to: email,
      brokerName: broker.name,
      buyingGroupName: group.name,
      token,
    });
  } catch (err) {
    console.error("Failed to send buyer invite email", err);
    return { error: "Couldn't send the invite email. Check the email configuration and try again." };
  }

  await db.invitation.create({
    data: {
      buyingGroupId,
      invitedByBrokerId: session.id,
      email,
      token,
      expiresAt,
    },
  });

  redirect(`/broker/dashboard/groups/${buyingGroupId}`);
}
