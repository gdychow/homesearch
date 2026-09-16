import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-900">Reset your password</h1>
          <p className="text-sm text-zinc-500">We&rsquo;ll email you a link to set a new one.</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
