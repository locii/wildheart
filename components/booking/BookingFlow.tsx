"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, format, isBefore, startOfDay,
  parseISO, isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location, AppointmentType } from "@/lib/supabase/types";

interface TimeSlot { start: string; end: string; label: string }
type Step = "location" | "type" | "date" | "time" | "details" | "confirm";

interface ClientData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

export function BookingFlow({
  locations,
  initialLocation,
  types,
  initialType,
  embed,
}: {
  locations: Location[];
  initialLocation?: Location;
  types: AppointmentType[];
  initialType?: AppointmentType;
  embed: boolean;
}) {
  const router = useRouter();

  // Determine which steps are needed
  const needsLocation = !initialLocation && locations.length > 1;
  const needsType = !initialType;

  const buildSteps = (): Step[] => {
    const steps: Step[] = [];
    if (needsLocation) steps.push("location");
    if (needsType) steps.push("type");
    steps.push("date", "time", "details", "confirm");
    return steps;
  };

  const STEPS = buildSteps();
  const STEP_LABELS: Record<Step, string> = {
    location: "Location",
    type: "Service",
    date: "Date",
    time: "Time",
    details: "Your details",
    confirm: "Confirm",
  };

  const [step, setStep] = useState<Step>(STEPS[0]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation ?? (locations.length === 1 ? locations[0] : null)
  );
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(initialType ?? null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [client, setClient] = useState<ClientData>({ first_name: "", last_name: "", phone: "", email: "" });
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  function advance() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  const stepIdx = STEPS.indexOf(step);

  // Filter types by location if a location is selected and types are location-scoped
  const visibleTypes = selectedLocation
    ? types.filter((t) => t.location_id === null || t.location_id === selectedLocation.id)
    : types;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-stone-100">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
        {stepIdx > 0 && (
          <button onClick={goBack} className="text-stone-400 hover:text-stone-700 -ml-1 p-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <span className="text-sm font-medium text-stone-700">{STEP_LABELS[step]}</span>
        <span className="text-xs text-stone-400 ml-auto">{stepIdx + 1} / {STEPS.length}</span>
      </div>

      <div className="p-4">
        {step === "location" && (
          <LocationStep
            locations={locations}
            onSelect={(l) => { setSelectedLocation(l); advance(); }}
          />
        )}
        {step === "type" && (
          <TypeStep
            types={visibleTypes}
            onSelect={(t) => { setSelectedType(t); advance(); }}
          />
        )}
        {step === "date" && selectedType && selectedLocation && (
          <DateStep
            locationSlug={selectedLocation.slug}
            duration={selectedType.duration_minutes}
            onSelect={(d) => { setSelectedDate(d); advance(); }}
          />
        )}
        {step === "time" && selectedType && selectedLocation && selectedDate && (
          <TimeStep
            locationSlug={selectedLocation.slug}
            date={selectedDate}
            duration={selectedType.duration_minutes}
            onSelect={(s) => { setSelectedSlot(s); advance(); }}
          />
        )}
        {step === "details" && (
          <DetailsStep
            client={client}
            onChange={setClient}
            onNext={advance}
          />
        )}
        {step === "confirm" && selectedType && selectedLocation && selectedDate && selectedSlot && (
          <ConfirmStep
            location={selectedLocation}
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
                  locationSlug: selectedLocation.slug,
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
              router.push(`/appointments/${selectedLocation.slug}/success?${params}`);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Step: Location ───────────────────────────────────────────────────────────

function LocationStep({ locations, onSelect }: { locations: Location[]; onSelect: (l: Location) => void }) {
  return (
    <div className="space-y-2">
      {locations.map((l) => (
        <button
          key={l.id}
          onClick={() => onSelect(l)}
          className="w-full text-left p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 active:bg-amber-50 transition-colors text-stone-800"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
            <span className="font-medium text-sm">{l.name}</span>
          </div>
          {l.address && <p className="text-xs text-stone-400 mt-1 ml-6">{l.address}</p>}
        </button>
      ))}
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
          className="w-full text-left p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 active:bg-amber-50 transition-colors text-stone-800"
        >
          <div className="font-medium text-sm">{t.name}</div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <Clock className="h-3 w-3" />{t.duration_minutes} min
            </span>
            {t.price > 0 && (
              <span className="flex items-center gap-1 text-xs text-stone-500">
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
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-stone-800">{format(viewMonth, "MMMM yyyy")}</span>
        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-stone-400 py-1">{d}</div>
        ))}
      </div>

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
                ${isPast ? "text-stone-300 cursor-not-allowed" : ""}
                ${!isPast && !isAvailable ? "text-stone-400 cursor-not-allowed" : ""}
                ${isAvailable && !isPast ? "text-stone-800 hover:bg-amber-500 hover:text-white active:scale-95" : ""}
                ${isSameDay(day, new Date()) ? "ring-1 ring-amber-400" : ""}
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
    return <div className="py-8 text-center text-sm text-stone-400">Loading times…</div>;
  }

  return (
    <div>
      <p className="text-sm text-stone-500 mb-4">{dateLabel}</p>
      {slots.length === 0 ? (
        <div className="py-8 text-center text-sm text-stone-400">
          No times available on this date
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.start}
              onClick={() => onSelect(slot)}
              className="py-3 text-sm font-medium text-stone-700 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-500 hover:text-white active:scale-95 transition-all"
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
      <div className="bg-stone-50 rounded-xl p-4 space-y-2.5 text-sm border border-stone-100">
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
      <span className="text-stone-500 shrink-0">{label}</span>
      <span className="text-right font-medium text-stone-800">{value}</span>
    </div>
  );
}
