"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, format, isBefore, startOfDay, isSameDay, parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingShell } from "@/components/booking/BookingShell";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

interface TimeSlot { start: string; end: string; label: string }

export default function ReschedulePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [appt, setAppt] = useState<AppointmentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [step, setStep] = useState<"date" | "time" | "confirm">("date");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/tokens/${token}`)
      .then((r) => r.json())
      .then(({ appointment, error }) => {
        if (error) setError(error);
        else setAppt(appointment);
        setLoading(false);
      });
  }, [token]);

  if (loading) return (
    <BookingShell backHref={`/manage/${token}`} backLabel="Back">
      <div className="px-8 py-12 text-center text-sm text-gray-400">Loading…</div>
    </BookingShell>
  );
  if (error || !appt) return (
    <BookingShell backHref="/" backLabel="Back to site">
      <div className="px-8 py-12 text-center text-sm text-gray-500">{error || "Appointment not found"}</div>
    </BookingShell>
  );

  async function confirm() {
    if (!slot || !appt) return;
    setSaving(true);
    // Cancel old appointment and create new one with same client/type/location
    const [, bookRes] = await Promise.all([
      fetch(`/api/appointments/${appt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelled: true, source: "reschedule" }),
      }),
      fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationSlug: appt.location.slug,
          typeId: appt.type.id,
          start: slot.start,
          client: {
            first_name: appt.client.first_name,
            last_name: appt.client.last_name,
            phone: appt.client.phone ?? "",
            email: appt.client.email,
          },
          source: "reschedule",
          scheduledBy: "client-self",
        }),
      }),
    ]);

    const { appointment: newAppt, token: newToken } = await bookRes.json();
    if (!bookRes.ok) { setSaving(false); setError("Could not reschedule. The slot may be taken."); return; }
    router.push(`/manage/${newToken}?rescheduled=1`);
  }

  return (
    <BookingShell
      backHref={step === "date" ? `/manage/${token}` : undefined}
      backLabel={step === "date" ? "Back to appointment" : undefined}
    >
      <div className="px-8 py-8">
        {step !== "date" && (
          <button onClick={() => setStep("date")}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-5">
            <ChevronLeft className="h-4 w-4" />
            Choose another date
          </button>
        )}

        <h1 className="text-xl font-semibold text-gray-900 mb-1">Reschedule</h1>
        <p className="text-sm text-gray-400 mb-6">{appt.type.name} · {appt.location.name}</p>

        {step === "date" && (
          <RescheduleDatePicker
            locationSlug={appt.location.slug}
            duration={appt.type.duration_minutes}
            onSelect={(d) => { setDate(d); setStep("time"); }}
          />
        )}

        {step === "time" && (
          <RescheduleTimePicker
            locationSlug={appt.location.slug}
            date={date}
            duration={appt.type.duration_minutes}
            onSelect={(s) => { setSlot(s); setStep("confirm"); }}
          />
        )}

        {step === "confirm" && slot && (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm space-y-2">
              <Row label="New date" value={format(parseISO(date), "EEEE d MMMM yyyy")} />
              <Row label="New time" value={slot.label} />
              <Row label="Service" value={appt.type.name} />
              <Row label="Location" value={appt.location.name} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={confirm} disabled={saving} className="w-full">
              {saving ? "Rescheduling…" : "Confirm new time"}
            </Button>
          </div>
        )}
      </div>
    </BookingShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function RescheduleDatePicker({ locationSlug, duration, onSelect }: {
  locationSlug: string; duration: number; onSelect: (d: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [available, setAvailable] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (m: Date) => {
    setLoading(true);
    const res = await fetch(`/api/availability/dates?location=${locationSlug}&month=${format(m, "yyyy-MM")}&duration=${duration}`);
    const { dates } = await res.json();
    setAvailable(new Set(dates ?? []));
    setLoading(false);
  }, [locationSlug, duration]);

  useEffect(() => { load(viewMonth); }, [viewMonth, load]);

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const startDow = getDay(startOfMonth(viewMonth));
  const today = startOfDay(new Date());
  const canGoPrev = !isBefore(startOfMonth(subMonths(viewMonth, 1)), startOfMonth(today));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewMonth((m) => subMonths(m, 1))} disabled={!canGoPrev}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{format(viewMonth, "MMMM yyyy")}</span>
        <button onClick={() => setViewMonth((m) => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className={`grid grid-cols-7 gap-y-1 ${loading ? "opacity-50" : ""}`}>
        {Array(startDow).fill(null).map((_, i) => <div key={i} />)}
        {days.map((day) => {
          const ds = format(day, "yyyy-MM-dd");
          const isPast = isBefore(day, today);
          const isAvail = available.has(ds);
          return (
            <button key={ds} onClick={() => isAvail && !isPast && onSelect(ds)}
              disabled={isPast || !isAvail}
              className={`aspect-square rounded-lg text-sm font-medium mx-0.5 transition-colors ${isPast || !isAvail ? "text-gray-200 cursor-not-allowed" : "hover:bg-gray-900 hover:text-white"} ${isSameDay(day, new Date()) ? "ring-1 ring-gray-300" : ""}`}>
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RescheduleTimePicker({ locationSlug, date, duration, onSelect }: {
  locationSlug: string; date: string; duration: number; onSelect: (s: TimeSlot) => void;
}) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/availability/slots?location=${locationSlug}&date=${date}&duration=${duration}`)
      .then((r) => r.json())
      .then(({ slots }) => { setSlots(slots ?? []); setLoading(false); });
  }, [locationSlug, date, duration]);

  if (loading) return <div className="py-8 text-center text-sm text-gray-400">Loading times…</div>;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{format(parseISO(date), "EEE d MMMM")}</p>
      {slots.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No times available on this date</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((s) => (
            <button key={s.start} onClick={() => onSelect(s)}
              className="py-3 text-sm font-medium rounded-xl border hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all">
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
