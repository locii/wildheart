import type { Location } from "@/lib/supabase/types";

export const LOCATION_PALETTE = [
  "#3b82f6", // blue
  "#7c3aed", // violet
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// Color swatches the user can pick from in the UI
export const COLOR_SWATCHES = [
  "#3b82f6", "#6366f1", "#7c3aed", "#a855f7",
  "#ec4899", "#ef4444", "#f97316", "#f59e0b",
  "#84cc16", "#10b981", "#06b6d4", "#0ea5e9",
  "#64748b", "#78716c",
];

export function locationColor(locations: Location[], slug: string): string {
  const idx = locations.findIndex((l) => l.slug === slug);
  const loc = locations[idx];
  if (loc?.color) return loc.color;
  return LOCATION_PALETTE[Math.max(0, idx) % LOCATION_PALETTE.length];
}
