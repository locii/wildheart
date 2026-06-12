import type { SupabaseClient } from "@supabase/supabase-js";

export type DoorCodes = Record<string, string>; // "0"=Sun … "6"=Sat

export type SmsTemplates = {
  booking?: string;
  cancellation?: string;
  reschedule?: string;
  reminder_24h?: string;
};

export const DEFAULT_SMS_TEMPLATES: Required<SmsTemplates> = {
  booking:
    "Hi {{first_name}}, your {{appointment_type}} at {{location}} is confirmed for {{date}} at {{time}}. Manage: {{manage_url}}",
  cancellation:
    "Hi {{first_name}}, your {{appointment_type}} on {{date}} at {{time}} has been cancelled. – Wildheart Psychotherapy",
  reschedule:
    "Hi {{first_name}}, your {{appointment_type}} has been rescheduled to {{date}} at {{time}}. Manage: {{manage_url}}",
  reminder_24h:
    "Hi {{first_name}}, reminder: your {{appointment_type}} is tomorrow at {{time}}. Door code: {{door_code}}. Manage: {{manage_url}}",
};

export const DEFAULT_DOOR_CODES: DoorCodes = {
  "0": "",
  "1": "",
  "2": "",
  "3": "",
  "4": "",
  "5": "",
  "6": "",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSetting<T>(supabase: SupabaseClient, key: string, fallback: T): Promise<T> {
  const { data } = await (supabase.from("settings") as any)
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? fallback;
}

export async function getDoorCodes(supabase: SupabaseClient): Promise<DoorCodes> {
  return getSetting(supabase, "door_codes", DEFAULT_DOOR_CODES);
}

export async function getSmsTemplates(supabase: SupabaseClient): Promise<Required<SmsTemplates>> {
  const saved = await getSetting<SmsTemplates>(supabase, "sms_templates", {});
  return { ...DEFAULT_SMS_TEMPLATES, ...saved };
}

/** Replace {{variable}} placeholders in a template string. */
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}
