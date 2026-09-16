import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-6 py-24 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">home-align</h1>
        <p className="max-w-md text-zinc-600">
          Capture and reconcile what a home-buying group actually wants, before
          the offer stage.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/broker/login"
          className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Broker sign in
        </Link>
        <Link
          href="/buyer/login"
          className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
        >
          Buyer sign in
        </Link>
      </div>
    </div>
  );
}
