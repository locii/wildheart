import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const locationId = req.nextUrl.searchParams.get("locationId");
  if (!locationId) return NextResponse.json({ error: "Missing locationId" }, { status: 400 });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("location_id", locationId)
    .order("day_of_week");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rules: data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const { locationId, rules } = await req.json();

  if (!locationId || !Array.isArray(rules)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const rows = rules.map((r: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
  }) => ({
    location_id: locationId,
    day_of_week: r.day_of_week,
    start_time: r.start_time,
    end_time: r.end_time,
    is_active: r.is_active,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("availability_rules") as any)
    .upsert(rows, { onConflict: "location_id,day_of_week" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
