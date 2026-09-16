import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";

export async function requireBroker(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== "broker") {
    redirect("/broker/login");
  }
  return session;
}

export async function requireBuyer(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== "buyer") {
    redirect("/buyer/login");
  }
  return session;
}
