import type { Client } from "@/lib/supabase/types";

export function clientUrl(c: { id: string; first_name: string; last_name: string }): string {
  const slug = `${c.first_name} ${c.last_name}`
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const shortId = c.id.replace(/-/g, "").slice(0, 8);
  return `/admin/clients/${slug}-${shortId}`;
}
