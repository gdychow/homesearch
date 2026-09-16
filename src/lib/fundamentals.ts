import type { Fundamental } from "@prisma/client";

export const FUNDAMENTALS: { key: Fundamental; label: string }[] = [
  { key: "LIGHT", label: "Light" },
  { key: "SPACE", label: "Space" },
  { key: "LOCATION", label: "Location" },
  { key: "LAYOUT", label: "Layout" },
  { key: "QUALITY", label: "Property quality" },
  { key: "WORK_REQUIRED", label: "Work required" },
];

export const FUNDAMENTAL_LABELS: Record<Fundamental, string> = Object.fromEntries(
  FUNDAMENTALS.map((f) => [f.key, f.label]),
) as Record<Fundamental, string>;
