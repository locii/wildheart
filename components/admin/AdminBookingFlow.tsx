"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, format, isBefore, startOfDay, isSameDay, parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location, AppointmentType, Client } from "@/lib/supabase/types";

type Step = "client" | "location" | "type" | "date" | "time" | "confirm";
interface TimeSlot { start: string; end: string; label: string }

export function AdminBookingFlow({
  locations,
  types,
  adminEmail,
}: {
  locations: Location[];
  types: AppointmentType[];
  adminEmail: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("client");
  const [client, setClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({ first_name: "", last_name: "", phone: "", email: "" });
  const [isNewClient, setIsNewClient] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [type, setType] = useState<AppointmentType | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const steps: Step[] = ["client", "location", "type", "date", "time", "confirm"];
  const stepIdx = steps.indexOf(step);

  function back() {
    if (stepIdx > 0) setStep(steps[stepIdx - 1]);
  }

  const STEP_LABELS: Record<Step, string> = {
    client: "Client",
    location: "Location",
    type: "Service",
    date: "Date",
    time: "Time",
    confirm: "Confirm",
  };

  async function book() {
    setBooking(true);
    setError("");
    const clientData = isNewClient
      ? newClient
      : { first_name: client!.first_name, last_name: client!.last_name, phone: client!.phone ?? "", email: client!.email };

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationSlug: location!.slug,
        typeId: type!.id,
        start: slot!.start,
        client: clientData,
        source: "admin",
        scheduledBy: adminEmail,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      setBooking(false);
      return;
    }
    router.push(`/admin/appointments/${json.appointment.id}`);
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-gray-900 transition-all"
          style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        {stepIdx > 0 && (
          <button onClick={back} className="text-gray-400 hover:text-gray-700 -ml-1 p-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <span className="text-sm font-medium">{STEP_LABELS[step]}</span>
        <span className="text-xs text-gray-400 ml-auto">{stepIdx + 1} / {steps.length}</span>
      </div>
      <div className="p-4">
        {step === "client" && (
          <ClientStep
            onSelect={(c) => { setClient(c); setIsNewClient(false); setStep("location"); }}
            onNew={(c) => { setNewClient(c); setIsNewClient(true); setStep("location"); }}
          />
        )}
        {step === "location" && (
          <PickerStep
            items={locations.map((l) => ({ id: l.id, label: l.name, sublabel: "" }))}
            onSelect={(id) => { setLocation(locations.find((l) => l.id === id)!); setStep("type"); }}
          />
        )}
        {step === "type" && (
          <PickerStep
            items={types.map((t) => ({ id: t.id, label: t.name, sublabel: `${t.duration_minutes} min · $${t.price}` }))}
            onSelect={(id) => { setType(types.find((t) => t.id === id)!); setStep("date"); }}
          />
        )}
        {step === "date" && location && type && (
          <AdminDateStep
            locationSlug={location.slug}
            duration={type.duration_minutes}
            onSelect={(d) => { setDate(d); setStep("time"); }}
          />
        )}
        {step === "time" && location && type && date && (
          <AdminTimeStep
            locationSlug={location.slug}
            date={date}
            duration={type.duration_minutes}
            onSelect={(s) => { setSlot(s); setStep("confirm"); }}
          />
        )}
        {step === "confirm" && location && type && slot && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <Row label="Client" value={isNewClient ? `${newClient.first_name} ${newClient.last_name}` : `${client!.first_name} ${client!.last_name}`} />
              <Row label="Location" value={location.name} />
              <Row label="Service" value={type.name} />
              <Row label="Date" value={format(parseISO(date), "EEE d MMMM yyyy")} />
              <Row label="Time" value={slot.label} />
              {type.price > 0 && <Row label="Fee" value={`$${type.price}`} />}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={book} disabled={booking} className="w-full">
              {booking ? "Booking…" : "Create appointment"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Client search step ───────────────────────────────────────────────────────

function ClientStep({
  onSelect,
  onNew,
}: {
  onSelect: (c: Client) => void;
  onNew: (c: { first_name: string; last_name: string; phone: string; email: string }) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const res = await fetch(`/api/clients?q=${encodeURIComponent(q)}`);
      const { clients } = await res.json();
      setResults(clients ?? []);
    }, 300);
  }, [q]);

  if (showNew) {
    const valid = form.first_name && form.last_name && form.email.includes("@");
    return (
      <div className="space-y-4">
        <button onClick={() => setShowNew(false)} className="flex items-center gap-1 text-sm text-gray-500">
          <X className="h-4 w-4" /> Cancel new client
        </button>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>First name</Label>
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <Button disabled={!valid} onClick={() => onNew(form)} className="w-full">Continue</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>

      {results.length > 0 && (
        <div className="border rounded-xl divide-y overflow-hidden">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm font-medium">{c.first_name} {c.last_name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{c.email}</div>
            </button>
          ))}
        </div>
      )}

      {q.trim() && results.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-2">No clients found</p>
      )}

      <button
        onClick={() => setShowNew(true)}
        className="w-full text-sm text-gray-500 border border-dashed rounded-xl py-3 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        + New client
      </button>
    </div>
  );
}

// ─── Generic picker step (location / type) ────────────────────────────────────

function PickerStep({
  items,
  onSelect,
}: {
  items: { id: string; label: string; sublabel: string }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="w-full text-left p-4 rounded-xl border hover:border-gray-400 active:bg-gray-50 transition-colors"
        >
          <div className="font-medium text-sm">{item.label}</div>
          {item.sublabel && <div className="text-xs text-gray-400 mt-0.5">{item.sublabel}</div>}
        </button>
      ))}
    </div>
  );
}

// ─── Date + Time steps (reuse logic from public booking) ─────────────────────

function AdminDateStep({
  locationSlug,
  duration,
  onSelect,
}: {
  locationSlug: string;
  duration: number;
  onSelect: (d: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadMonth = useCallback(async (month: Date) => {
    setLoading(true);
    const monthStr = format(month, "yyyy-MM");
    const res = await fetch(`/api/availability/dates?location=${locationSlug}&month=${monthStr}&duration=${duration}`);
    const { dates } = await res.json();
    setAvailableDates(new Set(dates ?? []));
    setLoading(false);
  }, [locationSlug, duration]);

  useEffect(() => { loadMonth(viewMonth); }, [viewMonth, loadMonth]);

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const startDow = getDay(startOfMonth(viewMonth));
  const today = startOfDay(new Date());
  const canGoPrev = !isBefore(startOfMonth(subMonths(viewMonth, 1)), startOfMonth(today));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewMonth((m) => subMonths(m, 1))} disabled={!canGoPrev} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{format(viewMonth, "MMMM yyyy")}</span>
        <button onClick={() => setViewMonth((m) => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className={`grid grid-cols-7 gap-y-1 ${loading ? "opacity-50" : ""}`}>
        {Array(startDow).fill(null).map((_, i) => <div key={`p-${i}`} />)}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isPast = isBefore(day, today);
          const isAvail = availableDates.has(dateStr);
          return (
            <button
              key={dateStr}
              onClick={() => isAvail && !isPast && onSelect(dateStr)}
              disabled={isPast || !isAvail}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors mx-0.5 ${isPast || !isAvail ? "text-gray-200 cursor-not-allowed" : "hover:bg-primary hover:text-primary-foreground"} ${isSameDay(day, new Date()) ? "ring-1 ring-gray-300" : ""}`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AdminTimeStep({
  locationSlug,
  date,
  duration,
  onSelect,
}: {
  locationSlug: string;
  date: string;
  duration: number;
  onSelect: (s: TimeSlot) => void;
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
        <div className="py-8 text-center text-sm text-gray-400">No times available</div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((s) => (
            <button key={s.start} onClick={() => onSelect(s)}
              className="py-3 text-sm font-medium rounded-xl border hover:border-gray-900 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
