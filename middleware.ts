import { NextRequest, NextResponse } from "next/server";

// Matches exactly 7 chars using the shortcode charset (no 0/1/l to avoid ambiguity)
const SHORTCODE_RE = /^\/[a-km-z2-9]{7}$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!SHORTCODE_RE.test(pathname)) return NextResponse.next();

  const code = pathname.slice(1);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) return NextResponse.next();

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/short_urls?code=eq.${code}&select=target_url&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    const rows = await res.json() as { target_url: string }[];
    if (rows?.[0]?.target_url) {
      return NextResponse.redirect(rows[0].target_url, { status: 302 });
    }
  } catch {
    // If lookup fails, fall through to the normal route
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:code([a-km-z2-9]{7})",
};
