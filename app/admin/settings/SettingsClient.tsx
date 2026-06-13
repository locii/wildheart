"use client";

import { useState } from "react";
import { Save, Check } from "lucide-react";
import type { DoorCodes, SmsTemplates, ReminderSettings } from "@/lib/notifications/settings";

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
  { key: "booking", label: "Booking confirmation", hint: "Sent immediately when a client books." },
  { key: "cancellation", label: "Cancellation", hint: "Sent when an appointment is cancelled." },
  { key: "reschedule", label: "Reschedule confirmation", hint: "Sent when an appointment is moved to a new time." },
  { key: "reminder_24h", label: "24-hour reminder", hint: "Sent the day before the appointment. Supports {{door_code}}." },
  { key: "reminder_48h", label: "48-hour reminder", hint: "Sent 2 days before the appointment." },
];

const VARIABLES = [
  "{{first_name}}", "{{appointment_type}}", "{{location}}",
  "{{date}}", "{{time}}", "{{manage_url}}", "{{door_code}}",
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
      {saved ? <><Check className="h-4 w-4" /> Saved</> : saving ? "Saving…" : <><Save className="h-4 w-4" /> Save</>}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full flex items-center transition-colors shrink-0 ${checked ? "bg-primary" : "bg-border"}`}
    >
      <span className={`w-3.5 h-3.5 bg-white rounded-full shadow mx-0.5 transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}

export function SettingsClient({
  doorCodes: initialDoorCodes,
  smsTemplates: initialTemplates,
  reminderSettings: initialReminders,
}: {
  doorCodes: DoorCodes;
  smsTemplates: Required<SmsTemplates>;
  reminderSettings: ReminderSettings;
}) {
  const [codes, setCodes] = useState<DoorCodes>(initialDoorCodes);
  const [codesSaving, setCodesSaving] = useState(false);
  const [codesSaved, setCodesSaved] = useState(false);

  const [templates, setTemplates] = useState<Required<SmsTemplates>>(initialTemplates);
  const [tmplSaving, setTmplSaving] = useState(false);
  const [tmplSaved, setTmplSaved] = useState(false);

  const [reminders, setReminders] = useState<ReminderSettings>(initialReminders);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderSaved, setReminderSaved] = useState(false);

  async function saveCodes(e: React.FormEvent) {
    e.preventDefault();
    setCodesSaving(true);
    try { await saveSetting("door_codes", codes); setCodesSaved(true); setTimeout(() => setCodesSaved(false), 2500); }
    finally { setCodesSaving(false); }
  }

  async function saveTemplates(e: React.FormEvent) {
    e.preventDefault();
    setTmplSaving(true);
    try { await saveSetting("sms_templates", templates); setTmplSaved(true); setTimeout(() => setTmplSaved(false), 2500); }
    finally { setTmplSaving(false); }
  }

  async function saveReminders(e: React.FormEvent) {
    e.preventDefault();
    setReminderSaving(true);
    try { await saveSetting("reminder_settings", reminders); setReminderSaved(true); setTimeout(() => setReminderSaved(false), 2500); }
    finally { setReminderSaving(false); }
  }

  return (
    <div className="space-y-8">

      {/* Reminder settings */}
      <section className="bg-card border rounded-xl p-5">
        <h2 className="text-base font-semibold mb-0.5">Reminder settings</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Control which channels are used for each automated reminder.
        </p>
        <form onSubmit={saveReminders} className="space-y-5">

          {/* 24h reminder */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">24-hour reminder</p>
                <p className="text-xs text-muted-foreground mt-0.5">Always sent — control which channels below</p>
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Toggle
                  checked={reminders.reminder_24h.email}
                  onChange={(v) => setReminders((r) => ({ ...r, reminder_24h: { ...r.reminder_24h, email: v } }))}
                />
                Email
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Toggle
                  checked={reminders.reminder_24h.sms}
                  onChange={(v) => setReminders((r) => ({ ...r, reminder_24h: { ...r.reminder_24h, sms: v } }))}
                />
                SMS
              </label>
            </div>
          </div>

          {/* 48h reminder */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">48-hour reminder</p>
                <p className="text-xs text-muted-foreground mt-0.5">Optional — sent 2 days before the appointment</p>
              </div>
              <Toggle
                checked={reminders.reminder_48h.enabled}
                onChange={(v) => setReminders((r) => ({ ...r, reminder_48h: { ...r.reminder_48h, enabled: v } }))}
              />
            </div>
            {reminders.reminder_48h.enabled && (
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Toggle
                    checked={reminders.reminder_48h.email}
                    onChange={(v) => setReminders((r) => ({ ...r, reminder_48h: { ...r.reminder_48h, email: v } }))}
                  />
                  Email
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Toggle
                    checked={reminders.reminder_48h.sms}
                    onChange={(v) => setReminders((r) => ({ ...r, reminder_48h: { ...r.reminder_48h, sms: v } }))}
                  />
                  SMS
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <SaveButton saving={reminderSaving} saved={reminderSaved} />
          </div>
        </form>
      </section>

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
          Customise the text messages sent to clients. Click a variable to copy it.
        </p>
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
                onChange={(e) => setTemplates((prev) => ({ ...prev, [key]: e.target.value }))}
                rows={3}
                className="w-full bg-background border rounded-lg px-3 py-2.5 text-sm leading-relaxed font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground/60 mt-1 text-right">{templates[key].length} chars</p>
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
