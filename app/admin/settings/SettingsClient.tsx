"use client";

import { useState } from "react";
import { Save, Check } from "lucide-react";
import type { DoorCodes, SmsTemplates } from "@/lib/notifications/settings";

const DAYS = [
  { key: "1", label: "Monday" },
  { key: "2", label: "Tuesday" },
  { key: "3", label: "Wednesday" },
  { key: "4", label: "Thursday" },
  { key: "5", label: "Friday" },
  { key: "6", label: "Saturday" },
  { key: "0", label: "Sunday" },
];

const SMS_TYPES: { key: keyof Required<SmsTemplates>; label: string; hint: string }[] = [
  {
    key: "booking",
    label: "Booking confirmation",
    hint: "Sent immediately when a client books.",
  },
  {
    key: "cancellation",
    label: "Cancellation",
    hint: "Sent when an appointment is cancelled.",
  },
  {
    key: "reschedule",
    label: "Reschedule confirmation",
    hint: "Sent when an appointment is moved to a new time.",
  },
  {
    key: "reminder_24h",
    label: "24-hour reminder",
    hint: "Sent the day before the appointment. Supports {{door_code}}.",
  },
];

const VARIABLES = [
  "{{first_name}}",
  "{{appointment_type}}",
  "{{location}}",
  "{{date}}",
  "{{time}}",
  "{{manage_url}}",
  "{{door_code}}",
];

async function saveSetting(key: string, value: unknown) {
  const res = await fetch(`/api/cms/settings/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error("Failed to save");
}

function SaveButton({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60 transition-colors hover:bg-primary/90"
    >
      {saved ? (
        <><Check className="h-4 w-4" /> Saved</>
      ) : saving ? (
        "Saving…"
      ) : (
        <><Save className="h-4 w-4" /> Save</>
      )}
    </button>
  );
}

export function SettingsClient({
  doorCodes: initialDoorCodes,
  smsTemplates: initialTemplates,
}: {
  doorCodes: DoorCodes;
  smsTemplates: Required<SmsTemplates>;
}) {
  const [codes, setCodes] = useState<DoorCodes>(initialDoorCodes);
  const [codesSaving, setCodesSaving] = useState(false);
  const [codesSaved, setCodesSaved] = useState(false);

  const [templates, setTemplates] = useState<Required<SmsTemplates>>(initialTemplates);
  const [tmplSaving, setTmplSaving] = useState(false);
  const [tmplSaved, setTmplSaved] = useState(false);

  async function saveCodes(e: React.FormEvent) {
    e.preventDefault();
    setCodesSaving(true);
    try {
      await saveSetting("door_codes", codes);
      setCodesSaved(true);
      setTimeout(() => setCodesSaved(false), 2500);
    } finally {
      setCodesSaving(false);
    }
  }

  async function saveTemplates(e: React.FormEvent) {
    e.preventDefault();
    setTmplSaving(true);
    try {
      await saveSetting("sms_templates", templates);
      setTmplSaved(true);
      setTimeout(() => setTmplSaved(false), 2500);
    } finally {
      setTmplSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Door codes */}
      <section className="bg-card border rounded-xl p-5">
        <h2 className="text-base font-semibold mb-0.5">Door codes</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Set the code for each day. Clients receive the code for their session day in the 24-hour reminder.
        </p>
        <form onSubmit={saveCodes} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DAYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-24 text-sm text-muted-foreground shrink-0">{label}</label>
                <input
                  type="text"
                  value={codes[key] ?? ""}
                  onChange={(e) => setCodes((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder="—"
                  className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <SaveButton saving={codesSaving} saved={codesSaved} />
          </div>
        </form>
      </section>

      {/* SMS templates */}
      <section className="bg-card border rounded-xl p-5">
        <h2 className="text-base font-semibold mb-0.5">SMS templates</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Customise the text messages sent to clients. Use the variables below anywhere in a template.
        </p>

        {/* Variable chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {VARIABLES.map((v) => (
            <code
              key={v}
              className="px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground font-mono select-all cursor-pointer"
              title="Click to copy"
              onClick={() => navigator.clipboard.writeText(v)}
            >
              {v}
            </code>
          ))}
        </div>

        <form onSubmit={saveTemplates} className="space-y-6">
          {SMS_TYPES.map(({ key, label, hint }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <p className="text-xs text-muted-foreground mb-2">{hint}</p>
              <textarea
                value={templates[key]}
                onChange={(e) =>
                  setTemplates((prev) => ({ ...prev, [key]: e.target.value }))
                }
                rows={3}
                className="w-full bg-background border rounded-lg px-3 py-2.5 text-sm leading-relaxed font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground/60 mt-1 text-right">
                {templates[key].length} chars
              </p>
            </div>
          ))}
          <div className="flex justify-end">
            <SaveButton saving={tmplSaving} saved={tmplSaved} />
          </div>
        </form>
      </section>
    </div>
  );
}
