import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("appointment_types")
    .select("*")
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ types: data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json() as { name: string; duration_minutes: number; price: number; description?: string | null; location_id?: string | null };

  // Set sort_order to max + 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase.from("appointment_types") as any;

  const { data: last } = await db.select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const sort_order = (last?.sort_order ?? 0) + 1;

  const { data, error } = await db.insert({ ...body, is_active: true, sort_order }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ type: data }, { status: 201 });
}
