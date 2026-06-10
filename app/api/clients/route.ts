import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const PER_PAGE = 50;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const supabase = createServiceClient();

  let query = supabase.from("clients").select("*", { count: "exact" }).order("last_name");

  if (q.trim()) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const from = (page - 1) * PER_PAGE;
  const { data, error, count } = await query.range(from, from + PER_PAGE - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clients: data ?? [], total: count ?? 0, page, perPage: PER_PAGE });
}
