import { FUNDAMENTAL_LABELS } from "@/lib/fundamentals";
import type { Fundamental } from "@prisma/client";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-500" aria-label={`${value} out of 5 stars`}>
      {"★".repeat(value)}
      <span className="text-zinc-300">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export interface FeedbackEntryData {
  id: string;
  visitDate: Date | null;
  notes: string | null;
  fundamentalScores: { fundamental: Fundamental; stars: number }[];
  mustHaveScores: { stars: number; featureCatalog: { label: string } }[];
}

export function FeedbackEntry({ feedback, heading }: { feedback: FeedbackEntryData; heading?: string }) {
  return (
    <div className="space-y-2 rounded-md border border-zinc-200 p-4">
      <div className="flex items-center justify-between">
        {heading && <p className="text-sm font-semibold text-zinc-900">{heading}</p>}
        <p className="text-xs text-zinc-400">
          {feedback.visitDate
            ? new Date(feedback.visitDate).toLocaleDateString(undefined, { timeZone: "UTC" })
            : "No date"}
        </p>
      </div>

      {feedback.fundamentalScores.length > 0 && (
        <ul className="space-y-0.5 text-sm">
          {feedback.fundamentalScores.map((s) => (
            <li key={s.fundamental} className="flex items-center justify-between">
              <span className="text-zinc-600">{FUNDAMENTAL_LABELS[s.fundamental]}</span>
              <Stars value={s.stars} />
            </li>
          ))}
        </ul>
      )}

      {feedback.mustHaveScores.length > 0 && (
        <ul className="space-y-0.5 text-sm">
          {feedback.mustHaveScores.map((s, i) => (
            <li key={i} className="flex items-center justify-between">
              <span className="text-zinc-600">{s.featureCatalog.label}</span>
              <Stars value={s.stars} />
            </li>
          ))}
        </ul>
      )}

      {feedback.notes && <p className="text-sm text-zinc-700">{feedback.notes}</p>}
    </div>
  );
}
