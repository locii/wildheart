import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { dispatch } from "@/lib/notifications/dispatch";
import { createAppointmentToken } from "@/lib/tokens";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized invocations
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.REMINDERS_ENABLED !== "true") {
    return NextResponse.json({ message: "Reminders disabled" });
  }

  const supabase = createServiceClient();
  const now = new Date();

  // Find appointments in the 24h window (23:50 – 24:10 from now)
  const window24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000);
  const window24hEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 1000);

  // Find appointments in the 1h window (50 – 70 min from now)
  const window1hStart = new Date(now.getTime() + 50 * 60 * 1000);
  const window1hEnd = new Date(now.getTime() + 70 * 60 * 1000);

  const results = { reminder_24h: 0, reminder_1h: 0, errors: [] as string[] };

  async function sendReminders(
    startWindow: Date,
    endWindow: Date,
    type: "reminder_24h" | "reminder_1h"
  ) {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
      .gte("start_at", startWindow.toISOString())
      .lte("start_at", endWindow.toISOString())
      .is("cancelled_at", null);

    if (error) {
      results.errors.push(`${type} query error: ${error.message}`);
      return;
    }

    for (const appt of (data ?? []) as AppointmentWithRelations[]) {
      // Check we haven't already sent this reminder
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("appointment_id", appt.id)
        .eq("type", type)
        .eq("status", "sent")
        .maybeSingle();

      if (existing) continue; // Already sent

      const token = await createAppointmentToken(supabase, appt.id, appt.start_at);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const manageUrl = `${appUrl}/manage/${token}`;

      await dispatch(supabase, type, appt, {
        channels: ["email", ...(appt.client.phone ? ["sms" as const] : [])],
        manageUrl,
      });

      results[type]++;
    }
  }

  await Promise.all([
    sendReminders(window24hStart, window24hEnd, "reminder_24h"),
    sendReminders(window1hStart, window1hEnd, "reminder_1h"),
  ]);

  return NextResponse.json(results);
}
