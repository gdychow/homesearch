import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const FEATURES: { key: string; label: string; category: string }[] = [
  { key: "outdoor_space", label: "Outdoor space / yard", category: "Outdoor" },
  { key: "pool", label: "Pool", category: "Outdoor" },
  { key: "views", label: "Views", category: "Outdoor" },
  { key: "storage_space", label: "Storage space", category: "Interior space" },
  { key: "primary_suite", label: "Primary suite / walk-in closet", category: "Interior space" },
  { key: "home_office", label: "Home office / flex room", category: "Interior space" },
  { key: "high_ceilings", label: "High ceilings", category: "Interior space" },
  { key: "natural_light", label: "Natural light", category: "Interior space" },
  { key: "open_floor_plan", label: "Open floor plan / entertaining space", category: "Layout" },
  { key: "single_story", label: "Single-story layout", category: "Layout" },
  { key: "in_law_suite", label: "Multi-generational layout (in-law suite)", category: "Layout" },
  { key: "updated_kitchen", label: "Updated kitchen", category: "Kitchen" },
  { key: "large_kitchen", label: "Large kitchen / island", category: "Kitchen" },
  { key: "move_in_ready", label: "Move-in ready (minimal work required)", category: "Condition" },
  { key: "modern_finishes", label: "Modern / updated finishes", category: "Condition" },
  { key: "newer_systems", label: "Newer systems (roof, HVAC, electrical)", category: "Condition" },
  { key: "garage", label: "Garage / covered parking", category: "Practical" },
  { key: "quiet_street", label: "Quiet street / privacy", category: "Practical" },
  { key: "proximity_parks", label: "Proximity to parks / trails", category: "Practical" },
  { key: "energy_efficiency", label: "Energy efficiency", category: "Practical" },
];

async function main() {
  for (const feature of FEATURES) {
    await db.featureCatalog.upsert({
      where: { key: feature.key },
      update: { label: feature.label, category: feature.category },
      create: feature,
    });
  }
  console.log(`Seeded ${FEATURES.length} feature catalog entries.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
