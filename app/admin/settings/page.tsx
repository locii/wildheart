import { createServiceClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";
import { DEFAULT_DOOR_CODES, DEFAULT_SMS_TEMPLATES, type DoorCodes, type SmsTemplates } from "@/lib/notifications/settings";

export const dynamic = "force-dynamic";

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const { data } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  return data?.value ?? fallback;
}

export default async function SettingsPage() {
  const [doorCodes, smsTemplates] = await Promise.all([
    getSetting<DoorCodes>("door_codes", DEFAULT_DOOR_CODES),
    getSetting<SmsTemplates>("sms_templates", {}),
  ]);

  const mergedTemplates = { ...DEFAULT_SMS_TEMPLATES, ...smsTemplates };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage door codes and SMS message templates.
        </p>
      </div>

      <SettingsClient doorCodes={doorCodes} smsTemplates={mergedTemplates} />
    </div>
  );
}
