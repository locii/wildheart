import twilio from "twilio";
import type { AppointmentWithRelations } from "@/lib/supabase/types";
import { formatApptDateTime } from "./format";
import { interpolate, DEFAULT_SMS_TEMPLATES } from "./settings";

export type SmsType = "booking" | "cancellation" | "reschedule" | "reminder_24h";

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
  return twilio(sid, token, { timeout: 10000 });
}

export async function sendSms(
  type: SmsType,
  appt: AppointmentWithRelations,
  options: { manageUrl?: string; doorCode?: string; smsTemplate?: string } = {}
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
  const { manageUrl = "", doorCode = "", smsTemplate } = options;

  const locationStr = location.address
    ? `${location.name}, ${location.address}`
    : location.name;

  const vars: Record<string, string> = {
    first_name: client.first_name,
    appointment_type: apptType.name,
    location: locationStr,
    date,
    time,
    manage_url: manageUrl,
    door_code: doorCode,
  };

  const template = smsTemplate ?? DEFAULT_SMS_TEMPLATES[type];
  const body = interpolate(template, vars);

  try {
    await twilioClient.messages.create({ body, from, to });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
