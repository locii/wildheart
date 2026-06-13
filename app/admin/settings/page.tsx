import { createServiceClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";
import {
  DEFAULT_DOOR_CODES, DEFAULT_SMS_TEMPLATES, DEFAULT_REMINDER_SETTINGS,
  type DoorCodes, type SmsTemplates, type ReminderSettings,
} from "@/lib/notifications/settings";

export const dynamic = "force-dynamic";

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const { data } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  return data?.value ?? fallback;
}

export default async function SettingsPage() {
  const [doorCodes, smsTemplates, savedReminders] = await Promise.all([
    getSetting<DoorCodes>("door_codes", DEFAULT_DOOR_CODES),
    getSetting<SmsTemplates>("sms_templates", {}),
    getSetting<Partial<ReminderSettings>>("reminder_settings", {}),
  ]);

  const mergedTemplates = { ...DEFAULT_SMS_TEMPLATES, ...smsTemplates };
  const reminderSettings: ReminderSettings = {
    reminder_24h: { ...DEFAULT_REMINDER_SETTINGS.reminder_24h, ...savedReminders.reminder_24h },
    reminder_48h: { ...DEFAULT_REMINDER_SETTINGS.reminder_48h, ...savedReminders.reminder_48h },
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage door codes, SMS templates, and reminder settings.
        </p>
      </div>

      <SettingsClient
        doorCodes={doorCodes}
        smsTemplates={mergedTemplates}
        reminderSettings={reminderSettings}
      />
    </div>
  );
}
