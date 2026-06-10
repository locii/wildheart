import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const locationId = req.nextUrl.searchParams.get("locationId");
  const supabase = createServiceClient();

  let query = supabase.from("availability_overrides").select("*").order("date");
  // "all" or omitted = return all locations; specific uuid = filter
  if (locationId && locationId !== "all") {
    query = query.eq("location_id", locationId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ overrides: data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error, data } = await (supabase.from("availability_overrides") as any)
    .insert({
      location_id: body.locationId,
      date: body.date,
      is_blocked: true,
      start_time: body.allDay ? null : body.startTime,
      end_time: body.allDay ? null : body.endTime,
      repeat_weekly: body.repeatWeekly ?? false,
      notes: body.notes ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ override: data });
}
