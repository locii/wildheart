import { addMinutes, format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface TimeSlot {
  start: string;       // UTC ISO string
  end: string;         // UTC ISO string
  label: string;       // "9:00 am"
}

function localTimeToUtc(dateStr: string, timeStr: string, timezone: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.substring(0, 5).split(":").map(Number);
  return fromZonedTime(new Date(year, month - 1, day, hours, minutes, 0, 0), timezone);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export async function getAvailableSlots(
  supabase: SupabaseClient,
  params: {
    locationId: string;
    allLocationIds: string[];
    date: string;       // YYYY-MM-DD in location timezone
    duration: number;   // minutes
    timezone: string;
  }
): Promise<TimeSlot[]> {
  const { locationId, allLocationIds, date, duration, timezone } = params;

  // Day of week in the location's timezone
  const localMidday = localTimeToUtc(date, "12:00", timezone);
  const dayOfWeek = toZonedTime(localMidday, timezone).getDay();

  // Weekly availability rule for this location + day
  const { data: rule } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("location_id", locationId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)
    .maybeSingle();

  if (!rule) return [];

  // All overrides for this location — filter in JS
  const { data: allOverrides } = await supabase
    .from("availability_overrides")
    .select("*")
    .eq("location_id", locationId)
    .eq("is_blocked", true);

  const activeOverrides = (allOverrides ?? []).filter((o) => {
    if (!o.repeat_weekly) return o.date === date;
    // Repeating: check day-of-week matches and override date <= query date
    const overrideDow = toZonedTime(localTimeToUtc(o.date, "12:00", timezone), timezone).getDay();
    return overrideDow === dayOfWeek && o.date <= date;
  });

  // Whole-day block?
  if (activeOverrides.some((o) => !o.start_time)) return [];

  // All active appointments across both locations (cross-blocking)
  const dayStart = localTimeToUtc(date, "00:00", timezone).toISOString();
  const dayEnd = localTimeToUtc(date, "23:59", timezone).toISOString();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("start_at, end_at")
    .in("location_id", allLocationIds)
    .is("cancelled_at", null)
    .gte("start_at", dayStart)
    .lte("start_at", dayEnd);

  const windowStart = localTimeToUtc(date, rule.start_time, timezone);
  const windowEnd = localTimeToUtc(date, rule.end_time, timezone);

  // Helper: is a candidate start time blocked by override or appointment?
  const isBlocked = (slotStart: Date): boolean => {
    const slotEnd = addMinutes(slotStart, duration);
    const byOverride = activeOverrides.some((o) => {
      if (!o.start_time || !o.end_time) return false;
      const oStart = localTimeToUtc(date, o.start_time, timezone);
      const oEnd = localTimeToUtc(date, o.end_time, timezone);
      return overlaps(slotStart, slotEnd, oStart, oEnd);
    });
    const byAppointment = (appointments ?? []).some((a) =>
      overlaps(slotStart, slotEnd, new Date(a.start_at), new Date(a.end_at))
    );
    return byOverride || byAppointment;
  };

  // Snap cursor to the first whole local hour >= windowStart
  const localStart = toZonedTime(windowStart, timezone);
  const startMins = localStart.getMinutes();
  let cursor = startMins === 0 ? windowStart : addMinutes(windowStart, 60 - startMins);

  const slots: TimeSlot[] = [];

  while (addMinutes(cursor, duration) <= windowEnd) {
    if (!isBlocked(cursor)) {
      // On-the-hour slot is free — offer it
      slots.push({
        start: cursor.toISOString(),
        end: addMinutes(cursor, duration).toISOString(),
        label: format(toZonedTime(cursor, timezone), "h:mm a"),
      });
    } else {
      // On-the-hour is blocked — try the half-hour as a fallback
      const half = addMinutes(cursor, 30);
      if (addMinutes(half, duration) <= windowEnd && !isBlocked(half)) {
        slots.push({
          start: half.toISOString(),
          end: addMinutes(half, duration).toISOString(),
          label: format(toZonedTime(half, timezone), "h:mm a"),
        });
      }
    }

    cursor = addMinutes(cursor, 60);
  }

  return slots;
}
