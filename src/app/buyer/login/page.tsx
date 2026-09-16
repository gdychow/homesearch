import Link from "next/link";
import { LoginForm } from "./login-form";

export default function BuyerLoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-8">
        <h1 className="text-xl font-semibold text-zinc-900">Buyer sign in</h1>
        <LoginForm />
        <p className="text-sm text-zinc-500">
          <Link href="/buyer/forgot-password" className="font-medium text-zinc-900 underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}
