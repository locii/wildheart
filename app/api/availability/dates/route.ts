import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { eachDayOfInterval, startOfMonth, endOfMonth, format } from "date-fns";
import type { Location, AvailabilityRule, AvailabilityOverride } from "@/lib/supabase/types";

// Returns dates in a given month that have at least one availability window
// GET ?location=brunswick&month=2026-06&duration=50
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const locationSlug = searchParams.get("location");
  const month = searchParams.get("month"); // "YYYY-MM"

  if (!locationSlug || !month) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: locData } = await supabase.from("locations").select("*");
  const location = ((locData ?? []) as Location[]).find((l) => l.slug === locationSlug);
  if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });

  const timezone = location.timezone;
  const [year, mon] = month.split("-").map(Number);
  const monthStart = new Date(year, mon - 1, 1);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Availability rules (which days of week are open)
  const { data: rulesData } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("location_id", location.id)
    .eq("is_active", true);
  const rules = (rulesData ?? []) as AvailabilityRule[];
  const activeDows = new Set(rules.map((r) => r.day_of_week));

  // Overrides for this month (whole-day blocks only — partial blocks still show the date)
  const monthStartStr = format(monthStart, "yyyy-MM-dd");
  const monthEndStr = format(monthEnd, "yyyy-MM-dd");

  const { data: overridesData } = await supabase
    .from("availability_overrides")
    .select("*")
    .eq("location_id", location.id)
    .eq("is_blocked", true)
    .is("start_time", null);
  const wholeDayBlocks = (overridesData ?? []) as AvailabilityOverride[];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableDates: string[] = [];

  for (const day of days) {
    if (day < today) continue;

    const dateStr = format(day, "yyyy-MM-dd");
    const zonedDay = toZonedTime(fromZonedTime(new Date(`${dateStr}T12:00:00`), timezone), timezone);
    const dow = zonedDay.getDay();

    if (!activeDows.has(dow)) continue;

    // Check whole-day blocks
    const isBlocked = wholeDayBlocks.some((o) => {
      if (!o.repeat_weekly) return o.date === dateStr;
      const overrideDow = toZonedTime(
        fromZonedTime(new Date(`${o.date}T12:00:00`), timezone),
        timezone
      ).getDay();
      return overrideDow === dow && o.date <= dateStr;
    });

    if (!isBlocked) availableDates.push(dateStr);
  }

  return NextResponse.json({ dates: availableDates });
}
