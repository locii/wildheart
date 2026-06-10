"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  ChevronLeft, Mail, Phone, Calendar, Clock, MapPin,
  CheckCircle, AlertCircle, Send, Pencil, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { AppointmentWithRelations, Client, IntakeForm } from "@/lib/supabase/types";

interface Props {
  client: Client;
  appointments: AppointmentWithRelations[];
  intakeForm: IntakeForm | null;
}

export function ClientDetail({ client: initialClient, appointments, intakeForm }: Props) {
  const [client, setClient] = useState(initialClient);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ first_name: client.first_name, last_name: client.last_name, email: client.email, phone: client.phone ?? "" });
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  async function saveEdit() {
    setSaving(true);
    const res = await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, phone: draft.phone.trim() || null }),
    });
    const { client: updated } = await res.json();
    if (updated) setClient(updated);
    setEditing(false);
    setSaving(false);
  }

  function startEdit() {
    setDraft({ first_name: client.first_name, last_name: client.last_name, email: client.email, phone: client.phone ?? "" });
    setEditing(true);
  }

  const upcoming = appointments.filter(
    (a) => !a.cancelled_at && new Date(a.start_at) > new Date()
  );
  const past = appointments.filter(
    (a) => !a.cancelled_at && new Date(a.start_at) <= new Date()
  );
  const cancelled = appointments.filter((a) => !!a.cancelled_at);

  const intakeStatus = !intakeForm
    ? "none"
    : intakeForm.completed_at
    ? "completed"
    : "pending";

  async function resendIntakeLink() {
    const firstAppt = appointments.find((a) => !a.cancelled_at);
    if (!firstAppt) return;
    setResending(true);
    await fetch(`/api/appointments/${firstAppt.id}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "intake", channels: ["email"] }),
    });
    setResending(false);
    setResendDone(true);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1 text-sm text-gray-500 mb-5 -ml-1"
      >
        <ChevronLeft className="h-4 w-4" /> Clients
      </Link>

      {/* Header */}
      <div className="bg-card border rounded-2xl px-4 py-4 mb-4">
        {editing ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Input value={draft.first_name} onChange={(e) => setDraft((d) => ({ ...d, first_name: e.target.value }))} placeholder="First name" autoFocus />
              <Input value={draft.last_name}  onChange={(e) => setDraft((d) => ({ ...d, last_name:  e.target.value }))} placeholder="Last name" />
            </div>
            <Input type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} placeholder="Email" />
            <Input type="tel"   value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} placeholder="Phone (optional)" />
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={saveEdit} disabled={saving || !draft.first_name.trim() || !draft.email.includes("@")}>
                <Check className="h-3.5 w-3.5 mr-1" />{saving ? "Saving…" : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5 mr-1" />Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-lg font-semibold">{client.first_name} {client.last_name}</h1>
              <button onClick={startEdit} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 space-y-1.5">
              <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:underline">
                <Mail className="h-3.5 w-3.5 text-gray-400" />{client.email}
              </a>
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />{client.phone}
                </a>
              )}
              {client.last_appointment_at && (
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  Last appointment {formatDistanceToNow(new Date(client.last_appointment_at), { addSuffix: true })}
                </p>
              )}
              {past.length > 0 && (
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle className="h-3.5 w-3.5 text-gray-400" />
                  {past.length} session{past.length !== 1 ? "s" : ""}
                </p>
              )}
              {client.imported_from && (
                <Badge variant="outline" className="text-xs mt-1">Imported from {client.imported_from}</Badge>
              )}
            </div>
          </>
        )}
      </div>

      {/* Intake form status */}
      {intakeForm !== null && (
        <div className="bg-card border rounded-2xl px-4 py-4 mb-4">
          <h2 className="text-sm font-semibold mb-3">Intake form</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              {intakeStatus === "completed" ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Completed {format(new Date(intakeForm.completed_at!), "d MMM yyyy")}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-gray-500">Not yet completed</span>
                </>
              )}
            </div>
            {intakeStatus !== "completed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={resendIntakeLink}
                disabled={resending || resendDone}
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                {resendDone ? "Sent!" : resending ? "Sending…" : "Resend link"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Appointment history */}
      {upcoming.length > 0 && (
        <AppointmentSection title="Upcoming" items={upcoming} />
      )}
      {past.length > 0 && (
        <AppointmentSection title="Past" items={past} />
      )}
      {cancelled.length > 0 && (
        <AppointmentSection title="Cancelled" items={cancelled} muted />
      )}

      {appointments.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No appointments yet</p>
      )}
    </div>
  );
}

function AppointmentSection({
  title,
  items,
  muted,
}: {
  title: string;
  items: AppointmentWithRelations[];
  muted?: boolean;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</h2>
      <div className="bg-card border rounded-2xl divide-y overflow-hidden">
        {items.map((appt) => {
          const start = toZonedTime(new Date(appt.start_at), appt.timezone);
          return (
            <Link
              key={appt.id}
              href={`/admin/appointments/${appt.id}`}
              className={`flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors ${muted ? "opacity-50" : ""}`}
            >
              <div className="min-w-0">
                <p className={`font-medium text-sm ${muted ? "line-through" : ""}`}>{appt.type.name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{format(start, "d MMM yyyy")} at {format(start, "h:mm a")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{appt.location.name}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
