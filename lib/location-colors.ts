import type { Location } from "@/lib/supabase/types";

// oklch palette — warm-compatible, spread across hues, readable on dark bg
export const LOCATION_PALETTE = [
  "oklch(0.68 0.16 145)", // sage green
  "oklch(0.65 0.17 22)",  // warm coral
  "oklch(0.65 0.13 235)", // steel blue
  "oklch(0.65 0.15 55)",  // amber-gold
  "oklch(0.62 0.13 290)", // warm mauve
  "oklch(0.65 0.12 185)", // teal
  "oklch(0.65 0.15 340)", // dusty rose
  "oklch(0.68 0.13 100)", // warm olive
];

// Color swatches the user can pick from in the UI
export const COLOR_SWATCHES = [
  "oklch(0.65 0.17 22)",  "oklch(0.65 0.16 40)",  "oklch(0.68 0.15 65)",  "oklch(0.72 0.14 78)",
  "oklch(0.68 0.13 100)", "oklch(0.68 0.14 145)", "oklch(0.65 0.12 185)", "oklch(0.65 0.13 220)",
  "oklch(0.65 0.13 255)", "oklch(0.62 0.13 290)", "oklch(0.62 0.14 320)", "oklch(0.65 0.15 345)",
  "oklch(0.62 0.06 50)",  "oklch(0.55 0.05 180)",
];

export function locationColor(locations: Location[], slug: string): string {
  const idx = locations.findIndex((l) => l.slug === slug);
  const loc = locations[idx];
  if (loc?.color) return loc.color;
  return LOCATION_PALETTE[Math.max(0, idx) % LOCATION_PALETTE.length];
}
