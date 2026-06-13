import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SHORTCODE_RE = /^\/[a-km-z2-9]{7}$/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Short URL redirect — check before auth logic
  if (SHORTCODE_RE.test(pathname)) {
    const code = pathname.slice(1);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/short_urls?code=eq.${code}&select=target_url&limit=1`,
          { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
        );
        const rows = await res.json() as { target_url: string }[];
        if (rows?.[0]?.target_url) {
          return NextResponse.redirect(rows[0].target_url, { status: 302 });
        }
      } catch {
        // fall through to normal routing
      }
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|book|manage|api|resources|about|services|contact|workshops|finding-us).*)",
  ],
};
