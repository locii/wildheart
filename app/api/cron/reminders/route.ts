import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { dispatch } from "@/lib/notifications/dispatch";
import { createAppointmentToken, buildManageUrl } from "@/lib/tokens";
import { getReminderSettings } from "@/lib/notifications/settings";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.REMINDERS_ENABLED !== "true") {
    return NextResponse.json({ message: "Reminders disabled" });
  }

  const supabase = createServiceClient();
  const now = new Date();

  const settings = await getReminderSettings(supabase);

  const window24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000);
  const window24hEnd   = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 1000);
  const window48hStart = new Date(now.getTime() + 47 * 60 * 60 * 1000 + 50 * 60 * 1000);
  const window48hEnd   = new Date(now.getTime() + 48 * 60 * 60 * 1000 + 10 * 60 * 1000);

  const results = { reminder_24h: 0, reminder_48h: 0, errors: [] as string[] };

  async function sendReminders(
    startWindow: Date,
    endWindow: Date,
    type: "reminder_24h" | "reminder_48h",
    channels: ("email" | "sms")[]
  ) {
    if (channels.length === 0) return;

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
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("appointment_id", appt.id)
        .eq("type", type)
        .eq("status", "sent")
        .maybeSingle();

      if (existing) continue;

      const token = await createAppointmentToken(supabase, appt.id, appt.start_at);
      const manageUrl = buildManageUrl(token);

      // Only include SMS if client has a phone number
      const effectiveChannels = channels.filter(
        (c) => c === "email" || (c === "sms" && appt.client.phone)
      ) as ("email" | "sms")[];

      await dispatch(supabase, type, appt, { channels: effectiveChannels, manageUrl });

      results[type]++;
    }
  }

  // 24h reminder — always run, channels controlled by settings
  const channels24h: ("email" | "sms")[] = [
    ...(settings.reminder_24h.email ? ["email" as const] : []),
    ...(settings.reminder_24h.sms   ? ["sms"   as const] : []),
  ];
  await sendReminders(window24hStart, window24hEnd, "reminder_24h", channels24h);

  // 48h reminder — only run if enabled
  if (settings.reminder_48h.enabled) {
    const channels48h: ("email" | "sms")[] = [
      ...(settings.reminder_48h.email ? ["email" as const] : []),
      ...(settings.reminder_48h.sms   ? ["sms"   as const] : []),
    ];
    await sendReminders(window48hStart, window48hEnd, "reminder_48h", channels48h);
  }

  return NextResponse.json(results);
}
