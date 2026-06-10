import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/availability";
import type { Location } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const locationSlug = searchParams.get("location");
  const date = searchParams.get("date");
  const duration = Number(searchParams.get("duration"));

  if (!locationSlug || !date || !duration) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data } = await supabase.from("locations").select("*");
  const locations = (data ?? []) as Location[];
  if (!locations.length) return NextResponse.json({ slots: [] });

  const location = locations.find((l) => l.slug === locationSlug);
  if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });

  const allLocationIds = locations.map((l) => l.id);

  const slots = await getAvailableSlots(supabase as Parameters<typeof getAvailableSlots>[0], {
    locationId: location.id,
    allLocationIds,
    date,
    duration,
    timezone: location.timezone,
  });

  return NextResponse.json({ slots });
}
