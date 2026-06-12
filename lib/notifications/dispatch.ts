import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppointmentWithRelations, Notification } from "@/lib/supabase/types";
import { toZonedTime } from "date-fns-tz";
import { sendEmail, type EmailType } from "./email";
import { sendSms, type SmsType } from "./sms";
import { getDoorCodes, getSmsTemplates } from "./settings";

export type NotificationType = Notification["type"];

interface DispatchOptions {
  channels?: ("email" | "sms")[];
  manageUrl?: string;
  intakeUrl?: string;
  /** For reschedule emails — the original appointment details */
  oldAppt?: AppointmentWithRelations;
}

/** Send notifications and log each one to the notifications table. */
export async function dispatch(
  supabase: SupabaseClient,
  type: NotificationType,
  appt: AppointmentWithRelations,
  options: DispatchOptions = {}
) {
  const channels = options.channels ?? ["email"];

  // Fetch settings once upfront (only when SMS is a channel)
  const needsSmsSettings = channels.includes("sms");
  const [doorCodes, smsTemplates] = needsSmsSettings
    ? await Promise.all([getDoorCodes(supabase), getSmsTemplates(supabase)])
    : [null, null];

  // Derive door code from appointment day (only for 24h reminder)
  let doorCode: string | undefined;
  if (type === "reminder_24h" && doorCodes) {
    const apptDate = toZonedTime(new Date(appt.start_at), appt.timezone);
    const day = apptDate.getDay().toString();
    doorCode = doorCodes[day] ?? undefined;
  }

  for (const channel of channels) {
    let status: "sent" | "failed" | "skipped" = "skipped";
    let errorMsg: string | undefined;

    if (channel === "email") {
      const result = await sendEmail(type as EmailType, appt, { ...options, doorCode });
      status = result.ok ? "sent" : "failed";
      errorMsg = result.error;
    } else if (channel === "sms") {
      const smsTemplate = smsTemplates?.[type as SmsType];
      const result = await sendSms(type as SmsType, appt, {
        manageUrl: options.manageUrl,
        doorCode,
        smsTemplate,
      });
      status = result.ok ? "sent" : "failed";
      errorMsg = result.error;
    }

    if (errorMsg) {
      console.error(`Notification ${type}/${channel} failed for appt ${appt.id}: ${errorMsg}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("notifications") as any).insert({
      appointment_id: appt.id,
      type,
      channel,
      sent_at: status === "sent" ? new Date().toISOString() : null,
      status,
      error: errorMsg ?? null,
    });
  }
}
