import type { SupabaseClient } from "@supabase/supabase-js";

export type DoorCodes = Record<string, string>; // "0"=Sun … "6"=Sat

export type SmsTemplates = {
  booking?: string;
  cancellation?: string;
  reschedule?: string;
  reminder_24h?: string;
  reminder_48h?: string;
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
  reminder_48h:
    "Hi {{first_name}}, reminder: your {{appointment_type}} is in 2 days on {{date}} at {{time}}. Manage: {{manage_url}}",
};

export type ReminderChannels = { email: boolean; sms: boolean };
export type ReminderSettings = {
  reminder_24h: ReminderChannels;
  reminder_48h: ReminderChannels & { enabled: boolean };
};

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  reminder_24h: { email: false, sms: false },
  reminder_48h: { enabled: true, email: true, sms: true },
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

export async function getReminderSettings(supabase: SupabaseClient): Promise<ReminderSettings> {
  const saved = await getSetting<Partial<ReminderSettings>>(supabase, "reminder_settings", {});
  return {
    reminder_24h: { ...DEFAULT_REMINDER_SETTINGS.reminder_24h, ...saved.reminder_24h },
    reminder_48h: { ...DEFAULT_REMINDER_SETTINGS.reminder_48h, ...saved.reminder_48h },
  };
}

/** Replace {{variable}} placeholders in a template string. */
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}
