"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, format, isBefore, startOfDay,
  parseISO, isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location, AppointmentType } from "@/lib/supabase/types";

interface TimeSlot { start: string; end: string; label: string }
type Step = "type" | "date" | "time" | "details" | "confirm";

interface ClientData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

const STEPS: Step[] = ["type", "date", "time", "details", "confirm"];
const STEP_LABELS: Record<Step, string> = {
  type: "Service",
  date: "Date",
  time: "Time",
  details: "Your details",
  confirm: "Confirm",
};

export function BookingFlow({
  location,
  types,
  embed,
}: {
  location: Location;
  types: AppointmentType[];
  embed: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [client, setClient] = useState<ClientData>({ first_name: "", last_name: "", phone: "", email: "" });
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-gray-900 transition-all duration-300"
          style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        {stepIdx > 0 && (
          <button onClick={goBack} className="text-gray-400 hover:text-gray-700 -ml-1 p-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <span className="text-sm font-medium text-gray-700">{STEP_LABELS[step]}</span>
        <span className="text-xs text-gray-400 ml-auto">{stepIdx + 1} / {STEPS.length}</span>
      </div>

      <div className="p-4">
        {step === "type" && (
          <TypeStep
            types={types}
            onSelect={(t) => { setSelectedType(t); setStep("date"); }}
          />
        )}
        {step === "date" && selectedType && (
          <DateStep
            locationSlug={location.slug}
            duration={selectedType.duration_minutes}
            onSelect={(d) => { setSelectedDate(d); setStep("time"); }}
          />
        )}
        {step === "time" && selectedType && selectedDate && (
          <TimeStep
            locationSlug={location.slug}
            date={selectedDate}
            duration={selectedType.duration_minutes}
            onSelect={(s) => { setSelectedSlot(s); setStep("details"); }}
          />
        )}
        {step === "details" && (
          <DetailsStep
            client={client}
            onChange={setClient}
            onNext={() => setStep("confirm")}
          />
        )}
        {step === "confirm" && selectedType && selectedDate && selectedSlot && (
          <ConfirmStep
            location={location}
            type={selectedType}
            slot={selectedSlot}
            client={client}
            booking={booking}
            error={bookingError}
            onConfirm={async () => {
              setBooking(true);
              setBookingError("");
              const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  locationSlug: location.slug,
                  typeId: selectedType.id,
                  start: selectedSlot.start,
                  client,
                  source: embed ? "embed" : "self-book",
                }),
              });
              const json = await res.json();
              if (!res.ok) {
                setBookingError(json.error ?? "Something went wrong");
                setBooking(false);
                return;
              }
              const params = new URLSearchParams({
                id: json.appointment.id,
                token: json.token,
                ...(json.isNewClient ? { intake: "1" } : {}),
              });
              router.push(`/book/${location.slug}/success?${params}`);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Step: Type ───────────────────────────────────────────────────────────────

function TypeStep({ types, onSelect }: { types: AppointmentType[]; onSelect: (t: AppointmentType) => void }) {
  return (
    <div className="space-y-2">
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className="w-full text-left p-4 rounded-xl border hover:border-gray-400 active:bg-gray-50 transition-colors"
        >
          <div className="font-medium text-sm">{t.name}</div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />{t.duration_minutes} min
            </span>
            {t.price > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <DollarSign className="h-3 w-3" />{t.price}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Step: Date ───────────────────────────────────────────────────────────────

function DateStep({
  locationSlug,
  duration,
  onSelect,
}: {
  locationSlug: string;
  duration: number;
  onSelect: (date: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadMonth = useCallback(async (month: Date) => {
    setLoading(true);
    const monthStr = format(month, "yyyy-MM");
    const res = await fetch(
      `/api/availability/dates?location=${locationSlug}&month=${monthStr}&duration=${duration}`
    );
    const { dates } = await res.json();
    setAvailableDates(new Set(dates ?? []));
    setLoading(false);
  }, [locationSlug, duration]);

  useEffect(() => { loadMonth(viewMonth); }, [viewMonth, loadMonth]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDow = getDay(monthStart);
  const today = startOfDay(new Date());
  const canGoPrev = !isBefore(startOfMonth(subMonths(viewMonth, 1)), startOfMonth(today));

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{format(viewMonth, "MMMM yyyy")}</span>
        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 gap-y-1 ${loading ? "opacity-50" : ""}`}>
        {Array(startDow).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isPast = isBefore(day, today);
          const isAvailable = availableDates.has(dateStr);
          return (
            <button
              key={dateStr}
              onClick={() => isAvailable && !isPast && onSelect(dateStr)}
              disabled={isPast || !isAvailable}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-colors mx-0.5
                ${isPast ? "text-gray-200 cursor-not-allowed" : ""}
                ${!isPast && !isAvailable ? "text-gray-300 cursor-not-allowed" : ""}
                ${isAvailable && !isPast ? "hover:bg-gray-900 hover:text-white active:scale-95" : ""}
                ${isSameDay(day, new Date()) ? "ring-1 ring-gray-300" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step: Time ───────────────────────────────────────────────────────────────

function TimeStep({
  locationSlug,
  date,
  duration,
  onSelect,
}: {
  locationSlug: string;
  date: string;
  duration: number;
  onSelect: (slot: TimeSlot) => void;
}) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/availability/slots?location=${locationSlug}&date=${date}&duration=${duration}`)
      .then((r) => r.json())
      .then(({ slots }) => {
        setSlots(slots ?? []);
        setLoading(false);
      });
  }, [locationSlug, date, duration]);

  const dateLabel = format(parseISO(date), "EEE d MMMM");

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">Loading times…</div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{dateLabel}</p>
      {slots.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          No times available on this date
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.start}
              onClick={() => onSelect(slot)}
              className="py-3 text-sm font-medium rounded-xl border hover:border-gray-900 hover:bg-gray-900 hover:text-white active:scale-95 transition-all"
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step: Details ────────────────────────────────────────────────────────────

function DetailsStep({
  client,
  onChange,
  onNext,
}: {
  client: ClientData;
  onChange: (c: ClientData) => void;
  onNext: () => void;
}) {
  const valid =
    client.first_name.trim() &&
    client.last_name.trim() &&
    client.email.trim().includes("@");

  function update(field: keyof ClientData, value: string) {
    onChange({ ...client, [field]: value });
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (valid) onNext(); }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            value={client.first_name}
            onChange={(e) => update("first_name", e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            value={client.last_name}
            onChange={(e) => update("last_name", e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={client.email}
          onChange={(e) => update("email", e.target.value)}
          required
          autoComplete="email"
          inputMode="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone <span className="text-gray-400 font-normal">(optional)</span></Label>
        <Input
          id="phone"
          type="tel"
          value={client.phone}
          onChange={(e) => update("phone", e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
      </div>
      <Button type="submit" className="w-full mt-2" disabled={!valid}>
        Continue
      </Button>
    </form>
  );
}

// ─── Step: Confirm ────────────────────────────────────────────────────────────

function ConfirmStep({
  location,
  type,
  slot,
  client,
  booking,
  error,
  onConfirm,
}: {
  location: Location;
  type: AppointmentType;
  slot: TimeSlot;
  client: ClientData;
  booking: boolean;
  error: string;
  onConfirm: () => void;
}) {
  const startDate = parseISO(slot.start);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
        <Row label="Service" value={type.name} />
        <Row label="Location" value={location.name} />
        <Row label="Date" value={format(startDate, "EEEE d MMMM yyyy")} />
        <Row label="Time" value={slot.label} />
        <Row label="Duration" value={`${type.duration_minutes} min`} />
        {type.price > 0 && <Row label="Fee" value={`$${type.price}`} />}
        <div className="border-t pt-2.5 mt-1">
          <Row label="Name" value={`${client.first_name} ${client.last_name}`} />
          <Row label="Email" value={client.email} />
          {client.phone && <Row label="Phone" value={client.phone} />}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button onClick={onConfirm} disabled={booking} className="w-full" size="lg">
        {booking ? "Booking…" : "Confirm booking"}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
