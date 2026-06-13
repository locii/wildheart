import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("short_urls") as any)
    .select("target_url")
    .eq("code", code)
    .maybeSingle();

  if (!data?.target_url) {
    return new NextResponse("Link not found", { status: 404 });
  }

  return NextResponse.redirect(data.target_url, { status: 302 });
}
