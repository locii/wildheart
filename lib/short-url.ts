import type { SupabaseClient } from "@supabase/supabase-js";

const CHARS = "abcdefghijkmnpqrstuvwxyz23456789"; // no 0/O/1/l ambiguity
const CODE_LENGTH = 7;

function randomCode(): string {
  return Array.from({ length: CODE_LENGTH }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
}

/** Shorten a URL and return the full short URL string. Falls back to the original if not configured. */
export async function shorten(supabase: SupabaseClient, targetUrl: string): Promise<string> {
  const base = process.env.SHORT_URL_BASE;
  if (!base) return targetUrl;

  // Try up to 3 times in case of a code collision (extremely unlikely)
  for (let i = 0; i < 3; i++) {
    const code = randomCode();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("short_urls") as any)
      .insert({ code, target_url: targetUrl });
    if (!error) return `${base.replace(/\/$/, "")}/r/${code}`;
  }

  return targetUrl; // fallback to full URL if inserts kept failing
}
