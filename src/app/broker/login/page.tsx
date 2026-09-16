import Link from "next/link";
import { LoginForm } from "./login-form";

export default function BrokerLoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-900">Broker sign in</h1>
        </div>
        <LoginForm />
        <p className="text-sm text-zinc-500">
          Need an account?{" "}
          <Link href="/broker/signup" className="font-medium text-zinc-900 underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
