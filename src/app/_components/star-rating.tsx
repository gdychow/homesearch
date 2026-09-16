"use client";

import { useState } from "react";

export function StarRating({
  name,
  label,
  defaultValue = 0,
}: {
  name: string;
  label: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-zinc-700">{label}</span>
      <div className="flex items-center gap-1">
        <input type="hidden" name={name} value={value} />
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star === value ? 0 : star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className={`text-xl leading-none ${star <= value ? "text-amber-500" : "text-zinc-300"}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
