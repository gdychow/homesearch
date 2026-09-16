import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function BrokerSignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-900">Create your broker account</h1>
          <p className="text-sm text-zinc-500">Set up buying groups and invite your buyers.</p>
        </div>
        <SignupForm />
        <p className="text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/broker/login" className="font-medium text-zinc-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
