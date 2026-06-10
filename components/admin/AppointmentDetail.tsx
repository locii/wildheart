"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  ChevronLeft, MapPin, Clock, DollarSign,
  User, Mail, Phone, AlertCircle, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { AppointmentWithRelations } from "@/lib/supabase/types";
import { clientUrl } from "@/lib/client-url";
import type { NotificationType } from "@/lib/notifications/dispatch";

type AnyNotifyType = NotificationType | "intake";

const NOTIFY_OPTIONS: { value: AnyNotifyType; label: string }[] = [
  { value: "booking", label: "Booking confirmation" },
  { value: "cancellation", label: "Cancellation notice" },
  { value: "reschedule", label: "Reschedule confirmation" },
  { value: "reminder_24h", label: "24h reminder" },
  { value: "reminder_1h", label: "1h reminder" },
  { value: "intake", label: "Intake form invite" },
];

export function AppointmentDetail({ appointment: initial }: { appointment: AppointmentWithRelations }) {
  const router = useRouter();
  const [appt, setAppt] = useState(initial);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyType, setNotifyType] = useState<AnyNotifyType>("booking");
  const [notifyChannels, setNotifyChannels] = useState({ email: true, sms: false });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const start = toZonedTime(new Date(appt.start_at), appt.timezone);
  const end = toZonedTime(new Date(appt.end_at), appt.timezone);
  const isCancelled = !!appt.cancelled_at;
  const hasPhone = !!appt.client.phone;

  async function cancel() {
    setCancelling(true);
    const res = await fetch(`/api/appointments/${appt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cancelled: true,
        sendCancellationEmail: notifyChannels.email,
        sendCancellationSms: notifyChannels.sms,
      }),
    });
    const { appointment } = await res.json();
    setAppt(appointment);
    setCancelOpen(false);
    setCancelling(false);
    router.refresh();
  }

  async function sendNotification() {
    setSending(true);
    setSendResult(null);
    const channels = [
      ...(notifyChannels.email ? ["email" as const] : []),
      ...(notifyChannels.sms && hasPhone ? ["sms" as const] : []),
    ];
    const res = await fetch(`/api/appointments/${appt.id}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: notifyType, channels }),
    });
    setSendResult(res.ok ? "Sent successfully" : "Failed to send");
    setSending(false);
  }

  return (
    <>
      <div className="max-w-lg mx-auto px-4 py-5">
        <Link
          href="/admin/appointments"
          className="inline-flex items-center gap-1 text-sm text-gray-500 mb-5 -ml-1"
        >
          <ChevronLeft className="h-4 w-4" /> Appointments
        </Link>

        {isCancelled && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Cancelled on {format(new Date(appt.cancelled_at!), "d MMM yyyy")}
          </div>
        )}

        <div className="bg-card border rounded-2xl overflow-hidden mb-4">
          <div className="px-4 py-4 border-b">
            <div className="text-base font-semibold">{appt.type.name}</div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />{appt.location.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {format(start, "EEE d MMM")} · {format(start, "h:mm")}–{format(end, "h:mm a")}
              </span>
              {appt.type.price > 0 && (
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />${appt.type.price}
                </span>
              )}
            </div>
          </div>

          <div className="px-4 py-4 space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm">
              <User className="h-4 w-4 text-gray-400 shrink-0" />
              <Link href={clientUrl(appt.client)} className="font-medium hover:underline">
                {appt.client.first_name} {appt.client.last_name}
              </Link>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <a href={`mailto:${appt.client.email}`} className="text-gray-600 hover:underline">
                {appt.client.email}
              </a>
            </div>
            {appt.client.phone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <a href={`tel:${appt.client.phone}`} className="text-gray-600">
                  {appt.client.phone}
                </a>
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-muted/30 border-t text-xs text-gray-400 space-y-1">
            <div>Booked {format(new Date(appt.created_at), "d MMM yyyy 'at' h:mm a")}</div>
            {appt.rescheduled_at && (
              <div>Rescheduled {format(new Date(appt.rescheduled_at), "d MMM yyyy")}</div>
            )}
          </div>
        </div>

        {!isCancelled && (
          <div className="fixed bottom-[72px] left-0 right-0 px-4 pb-2 md:static md:bottom-auto md:pb-0 bg-muted/50 md:bg-transparent pt-2 md:pt-0 border-t md:border-0">
            <div className="max-w-lg mx-auto flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setNotifyOpen(true)}>
                <Send className="h-3.5 w-3.5 mr-1" /> Send notification
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                onClick={() => setCancelOpen(true)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirmation */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Cancel appointment?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            This will cancel {appt.client.first_name}&apos;s {appt.type.name} on{" "}
            {format(start, "d MMM")} at {format(start, "h:mm a")}. This cannot be undone.
          </p>
          <div className="mt-1 mb-3 space-y-2">
            <p className="text-xs font-medium text-gray-500">Also send notification:</p>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notifyChannels.email}
                onChange={(e) => setNotifyChannels((p) => ({ ...p, email: e.target.checked }))}
                className="rounded"
              />
              Email
            </label>
            {hasPhone && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyChannels.sms}
                  onChange={(e) => setNotifyChannels((p) => ({ ...p, sms: e.target.checked }))}
                  className="rounded"
                />
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

      {/* Send notification */}
      <Dialog open={notifyOpen} onOpenChange={(o) => { setNotifyOpen(o); if (!o) setSendResult(null); }}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Send notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Type</Label>
              <div className="space-y-1.5">
                {NOTIFY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="notifyType"
                      value={opt.value}
                      checked={notifyType === opt.value}
                      onChange={() => setNotifyType(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Channels</Label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyChannels.email}
                    onChange={(e) => setNotifyChannels((p) => ({ ...p, email: e.target.checked }))}
                  />
                  Email — {appt.client.email}
                </label>
                {hasPhone ? (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyChannels.sms}
                      onChange={(e) => setNotifyChannels((p) => ({ ...p, sms: e.target.checked }))}
                    />
                    SMS — {appt.client.phone}
                  </label>
                ) : (
                  <p className="text-xs text-gray-400">SMS unavailable — no phone number on file</p>
                )}
              </div>
            </div>
            {sendResult && (
              <p className={`text-sm ${sendResult.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {sendResult}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setNotifyOpen(false)}>Close</Button>
            <Button
              className="flex-1"
              onClick={sendNotification}
              disabled={sending || (!notifyChannels.email && !notifyChannels.sms)}
            >
              {sending ? "Sending…" : "Send"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
