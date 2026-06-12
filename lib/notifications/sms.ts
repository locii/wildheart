import twilio from "twilio";
import type { AppointmentWithRelations } from "@/lib/supabase/types";
import { formatApptDateTime } from "./format";

export type SmsType = "booking" | "cancellation" | "reschedule" | "reminder_24h" | "reminder_1h";

export interface SmsResult {
  ok: boolean;
  error?: string;
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("61")) return `+${digits}`;
  if (digits.startsWith("0")) return `+61${digits.slice(1)}`;
  return `+${digits}`;
}

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export async function sendSms(
  type: SmsType,
  appt: AppointmentWithRelations,
  options: { manageUrl?: string } = {}
): Promise<SmsResult> {
  const { client, type: apptType, location } = appt;

  if (!client.phone) {
    return { ok: false, error: "Client has no phone number" };
  }

  const from = process.env.TWILIO_FROM_NUMBER;
  if (!from) return { ok: false, error: "TWILIO_FROM_NUMBER not configured" };

  const twilioClient = getClient();
  if (!twilioClient) return { ok: false, error: "Twilio not configured" };

  const to = toE164(client.phone);

  const { date, time } = formatApptDateTime(appt.start_at, appt.end_at, appt.timezone);
  const { manageUrl = "" } = options;

  let body: string;
  switch (type) {
    case "booking": {
      const where = location.address ? `${location.name}, ${location.address}` : location.name;
      body = `Hi ${client.first_name}, your ${apptType.name} at ${where} is confirmed for ${date} at ${time}. Manage: ${manageUrl}`;
      break;
    }
    case "cancellation":
      body = `Hi ${client.first_name}, your ${apptType.name} on ${date} at ${time} has been cancelled. – Wildheart Psychotherapy`;
      break;
    case "reschedule":
      body = `Hi ${client.first_name}, your ${apptType.name} has been rescheduled to ${date} at ${time}. Manage: ${manageUrl}`;
      break;
    case "reminder_24h":
      body = `Hi ${client.first_name}, reminder: your ${apptType.name} is tomorrow on ${date} at ${time}. Manage: ${manageUrl}`;
      break;
  }

  try {
    await twilioClient.messages.create({ body, from, to });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
