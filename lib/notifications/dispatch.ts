import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppointmentWithRelations, Notification } from "@/lib/supabase/types";
import { sendEmail, type EmailType } from "./email";
import { sendSms, type SmsType } from "./sms";

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

  for (const channel of channels) {
    let status: "sent" | "failed" | "skipped" = "skipped";
    let errorMsg: string | undefined;

    if (channel === "email") {
      const result = await sendEmail(type as EmailType, appt, options);
      status = result.ok ? "sent" : "failed";
      errorMsg = result.error;
    } else if (channel === "sms") {
      const result = await sendSms(type as SmsType, appt, options);
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
    });
  }
}
