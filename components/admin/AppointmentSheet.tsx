"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import {
  MapPin, Clock, DollarSign, User, Mail, Phone,
  AlertCircle, ExternalLink, Send, Pencil, Check, X, CalendarPlus,
  CheckCircle, History,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AppointmentWithRelations, Json } from "@/lib/supabase/types";
import { clientUrl } from "@/lib/client-url";
import type { NotificationType } from "@/lib/notifications/dispatch";

const TZ = "Australia/Melbourne";

type AnyNotifyType = NotificationType | "intake";
const NOTIFY_OPTIONS: { value: AnyNotifyType; label: string }[] = [
  { value: "booking", label: "Booking confirmation" },
  { value: "reschedule", label: "Reschedule confirmation" },
  { value: "reminder_24h", label: "24h reminder" },
  { value: "reminder_1h", label: "1h reminder" },
  { value: "cancellation", label: "Cancellation notice" },
  { value: "intake", label: "Intake form invite" },
];

export function AppointmentSheet({
  appointmentId,
  onClose,
  onChanged,
}: {
  appointmentId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  type Session = { id: string; start_at: string; timezone: string; cancelled_at: string | null; type: { name: string } };
  type IntakeForm = { completed_at: string | null; data: Record<string, string> | null } | null;
  type IntakeQuestion = { id: string; question: string; field_key: string };

  const [appt, setAppt] = useState<AppointmentWithRelations | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [intakeForm, setIntakeForm] = useState<IntakeForm>(null);
  const [intakeQuestions, setIntakeQuestions] = useState<IntakeQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");
  const [savingReschedule, setSavingReschedule] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyType, setNotifyType] = useState<AnyNotifyType>("booking");
  const [notifyChannels, setNotifyChannels] = useState({ email: true, sms: false });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) { setAppt(null); return; }
    setLoading(true);
    fetch(`/api/appointments/${appointmentId}`)
      .then((r) => r.json())
      .then(({ appointment, sessions: s, intakeForm: i, intakeQuestions: q }) => {
        setAppt(appointment);
        setSessions(s ?? []);
        setIntakeForm(i ?? null);
        setIntakeQuestions(q ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [appointmentId]);

  function openReschedule() {
    if (!appt) return;
    const s = toZonedTime(new Date(appt.start_at), TZ);
    const e = toZonedTime(new Date(appt.end_at), TZ);
    setRescheduleDate(format(s, "yyyy-MM-dd"));
    setRescheduleStart(format(s, "HH:mm"));
    setRescheduleEnd(format(e, "HH:mm"));
    setRescheduleError("");
    setRescheduling(true);
  }

  async function saveReschedule() {
    if (!appt) return;
    setSavingReschedule(true);
    setRescheduleError("");
    const startUtc = fromZonedTime(new Date(`${rescheduleDate}T${rescheduleStart}:00`), TZ).toISOString();
    const endUtc = fromZonedTime(new Date(`${rescheduleDate}T${rescheduleEnd}:00`), TZ).toISOString();
    const res = await fetch(`/api/appointments/${appt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_at: startUtc, end_at: endUtc }),
    });
    const data = await res.json();
    setSavingReschedule(false);
    if (!res.ok) { setRescheduleError(data.error ?? "Could not reschedule."); return; }
    setAppt(data.appointment);
    setRescheduling(false);
    onChanged();
  }

  async function cancel() {
    if (!appt) return;
    setCancelling(true);
    const res = await fetch(`/api/appointments/${appt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancelled: true, sendCancellationEmail: notifyChannels.email, sendCancellationSms: notifyChannels.sms }),
    });
    const { appointment } = await res.json();
    setAppt(appointment);
    setCancelOpen(false);
    setCancelling(false);
    onChanged();
  }

  async function sendNotification() {
    if (!appt) return;
    setSending(true);
    setSendResult(null);
    const channels = [
      ...(notifyChannels.email ? ["email" as const] : []),
      ...(notifyChannels.sms && appt.client.phone ? ["sms" as const] : []),
    ];
    const res = await fetch(`/api/appointments/${appt.id}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: notifyType, channels }),
    });
    setSendResult(res.ok ? "Sent successfully" : "Failed to send");
    setSending(false);
  }

  const start = appt ? toZonedTime(new Date(appt.start_at), TZ) : null;
  const end = appt ? toZonedTime(new Date(appt.end_at), TZ) : null;
  const isCancelled = !!appt?.cancelled_at;

  return (
    <>
      <Sheet open={!!appointmentId} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto gap-0 p-0">
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle>
              {loading ? "Loading…" : appt ? `${appt.client.first_name} ${appt.client.last_name}` : "Appointment"}
            </SheetTitle>
          </SheetHeader>

          {loading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading…</div>
          )}

          {appt && start && end && (
            <div className="flex flex-col gap-0 h-full">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {isCancelled && (
                  <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Cancelled on {format(new Date(appt.cancelled_at!), "d MMM yyyy")}
                  </div>
                )}

                {/* Service + time */}
                <div className="bg-muted/40 rounded-xl px-4 py-3 space-y-2">
                  <div className="font-medium">{appt.type.name}</div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {appt.location.name}
                    </div>
                    {rescheduling ? (
                      <div className="space-y-2 pt-1">
                        <div className="space-y-1">
                          <Label className="text-xs">Date</Label>
                          <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="w-full text-sm bg-input border border-border rounded-lg px-3 py-1.5 text-foreground"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Start</Label>
                            <input type="time" value={rescheduleStart} onChange={(e) => setRescheduleStart(e.target.value)}
                              className="w-full text-sm bg-input border border-border rounded-lg px-3 py-1.5 text-foreground" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">End</Label>
                            <input type="time" value={rescheduleEnd} onChange={(e) => setRescheduleEnd(e.target.value)}
                              className="w-full text-sm bg-input border border-border rounded-lg px-3 py-1.5 text-foreground" />
                          </div>
                        </div>
                        {rescheduleError && <p className="text-xs text-red-400">{rescheduleError}</p>}
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={saveReschedule} disabled={savingReschedule}>
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            {savingReschedule ? "Saving…" : "Save"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRescheduling(false)}>
                            <X className="h-3.5 w-3.5 mr-1.5" />Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{format(start, "EEE d MMM")} · {format(start, "h:mm")}–{format(end, "h:mm a")}</span>
                        {!isCancelled && (
                          <button onClick={openReschedule} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                    {appt.type.price > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 shrink-0" />
                        ${appt.type.price}
                      </div>
                    )}
                  </div>
                </div>

                {/* Client */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Link href={clientUrl(appt.client)} className="font-medium hover:underline">
                        {appt.client.first_name} {appt.client.last_name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`mailto:${appt.client.email}`} className="text-muted-foreground hover:underline">{appt.client.email}</a>
                    </div>
                    {appt.client.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a href={`tel:${appt.client.phone}`} className="text-muted-foreground">{appt.client.phone}</a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Session history */}
                {sessions.length > 0 && (() => {
                  const now = new Date();
                  const active = sessions.filter(s => !s.cancelled_at);
                  const upcoming = active.filter(s => new Date(s.start_at) > now && s.id !== appt.id);
                  const past = active.filter(s => new Date(s.start_at) <= now && s.id !== appt.id);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sessions</p>
                        <span className="text-xs text-muted-foreground">{active.length} total</span>
                      </div>
                      {upcoming.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Upcoming</p>
                          {upcoming.slice(0, 3).map(s => (
                            <div key={s.id} className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{s.type.name}</span>
                              <span>{format(toZonedTime(new Date(s.start_at), s.timezone), "d MMM yyyy")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {past.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">History</p>
                          {past.slice(0, 5).map(s => (
                            <div key={s.id} className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{s.type.name}</span>
                              <span>{format(toZonedTime(new Date(s.start_at), s.timezone), "d MMM yyyy")}</span>
                            </div>
                          ))}
                          {past.length > 5 && (
                            <p className="text-[10px] text-muted-foreground/60">+{past.length - 5} more</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Intake form */}
                {intakeForm && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Intake form</p>
                      {intakeForm.completed_at ? (
                        <span className="flex items-center gap-1 text-xs text-green-500">
                          <CheckCircle className="h-3 w-3" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-500">
                          <History className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </div>
                    {intakeForm.completed_at && intakeQuestions.length > 0 && intakeForm.data && (
                      <div className="space-y-2.5">
                        {intakeQuestions.map(q => {
                          const answer = (intakeForm.data as Record<string, Json>)?.[q.field_key];
                          if (!answer && answer !== false) return null;
                          return (
                            <div key={q.id}>
                              <p className="text-[10px] text-muted-foreground/70 mb-0.5">{q.question}</p>
                              <p className="text-xs leading-relaxed">{String(answer)}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Meta */}
                <div className="text-xs text-muted-foreground/60 space-y-0.5">
                  <div>Booked {format(new Date(appt.created_at), "d MMM yyyy 'at' h:mm a")}</div>
                  {appt.rescheduled_at && <div>Rescheduled {format(new Date(appt.rescheduled_at), "d MMM yyyy")}</div>}
                </div>
              </div>

              {/* Actions */}
              {!isCancelled && (
                <div className="px-5 py-4 border-t space-y-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setNotifyOpen(true)}>
                      <Send className="h-3.5 w-3.5 mr-1" /> Notify
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-red-400 hover:text-red-300 hover:border-red-700" onClick={() => setCancelOpen(true)}>
                      Cancel
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/admin/appointments/new?clientId=${appt.client.id}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <CalendarPlus className="h-3 w-3" /> Book again
                    </Link>
                    <Link
                      href={`/admin/appointments/${appt.id}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Full details <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Cancel dialog */}
      {appt && start && (
        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle>Cancel appointment?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will cancel {appt.client.first_name}&apos;s {appt.type.name} on{" "}
              {format(start, "d MMM")} at {format(start, "h:mm a")}.
            </p>
            <div className="space-y-2 my-1">
              <p className="text-xs font-medium text-muted-foreground">Also send notification:</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={notifyChannels.email} onChange={(e) => setNotifyChannels((p) => ({ ...p, email: e.target.checked }))} className="rounded" />
                Email
              </label>
              {appt.client.phone && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={notifyChannels.sms} onChange={(e) => setNotifyChannels((p) => ({ ...p, sms: e.target.checked }))} className="rounded" />
                  SMS
                </label>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCancelOpen(false)}>Keep</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={cancel} disabled={cancelling}>
                {cancelling ? "Cancelling…" : "Yes, cancel"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Notify dialog */}
      {appt && (
        <Dialog open={notifyOpen} onOpenChange={(o) => { setNotifyOpen(o); if (!o) setSendResult(null); }}>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader><DialogTitle>Send notification</DialogTitle></DialogHeader>
            <div className="space-y-4 py-1">
              <div className="space-y-1.5">
                {NOTIFY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="notifyType" value={opt.value} checked={notifyType === opt.value} onChange={() => setNotifyType(opt.value)} />
                    {opt.label}
                  </label>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block">Channels</Label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={notifyChannels.email} onChange={(e) => setNotifyChannels((p) => ({ ...p, email: e.target.checked }))} />
                  Email — {appt.client.email}
                </label>
                {appt.client.phone ? (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={notifyChannels.sms} onChange={(e) => setNotifyChannels((p) => ({ ...p, sms: e.target.checked }))} />
                    SMS — {appt.client.phone}
                  </label>
                ) : (
                  <p className="text-xs text-muted-foreground/60">SMS unavailable — no phone number on file</p>
                )}
              </div>
              {sendResult && <p className={`text-sm ${sendResult.includes("success") ? "text-green-400" : "text-red-400"}`}>{sendResult}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setNotifyOpen(false)}>Close</Button>
              <Button className="flex-1" onClick={sendNotification} disabled={sending || (!notifyChannels.email && !notifyChannels.sms)}>
                {sending ? "Sending…" : "Send"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
