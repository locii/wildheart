"use client";

import { useState, useEffect, useCallback } from "react";
import {
  addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, format, isBefore, startOfDay, isSameDay, parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeSlot { start: string; end: string; label: string }
interface ClientData { first_name: string; last_name: string; email: string; phone: string }
type WizardStep = "select-time" | "details" | "confirm";

const STEPS: WizardStep[] = ["select-time", "details", "confirm"];
const STEP_LABELS: Record<WizardStep, string> = {
  "select-time": "Select time",
  details: "Your details",
  confirm: "Confirm",
};

export function BookingWizard({
  locationSlug,
  typeSlug,
  locationName,
  typeName,
  typeId,
  duration,
  price,
}: {
  locationSlug: string;
  typeSlug: string;
  locationName: string;
  typeName: string;
  typeId: string;
  duration: number;
  price: number;
}) {
  const [step, setStep] = useState<WizardStep>("select-time");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [client, setClient] = useState<ClientData>({ first_name: "", last_name: "", email: "", phone: "" });
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const basePath = `/${locationSlug}/${typeSlug}`;

  function goTo(s: WizardStep) {
    window.history.pushState({}, "", `${basePath}/${s}`);
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) goTo(STEPS[idx - 1]);
  }

  useEffect(() => {
    function onPop() {
      const seg = window.location.pathname.split("/").pop() as WizardStep;
      if (STEPS.includes(seg)) setStep(seg);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const stepIdx = STEPS.indexOf(step);
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  async function confirmBooking() {
    setBooking(true);
    setBookingError("");
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationSlug, typeId, start: selectedSlot!.start, client, source: "self-book" }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBookingError(json.error ?? "Something went wrong. Please try again.");
      setBooking(false);
      return;
    }
    const params = new URLSearchParams({ id: json.appointment.id, token: json.token, ...(json.isNewClient ? { intake: "1" } : {}) });
    window.location.href = `/${locationSlug}/success?${params}`;
  }

  return (
    <>
      {/* Progress + breadcrumb */}
      <div className="h-1 bg-stone-100">
        <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="px-5 py-3 border-b border-stone-100 flex items-center gap-1 text-sm min-w-0">
        {stepIdx > 0 && (
          <button onClick={goBack} className="text-stone-400 hover:text-stone-700 mr-1 shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <span className="text-stone-400 truncate">{locationName}</span>
        <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0 mx-0.5" />
        <span className="font-medium text-stone-700 truncate">{typeName}</span>
        <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0 mx-0.5" />
        <span className="font-medium text-amber-600 shrink-0">{STEP_LABELS[step]}</span>
      </div>

      <div className="p-5">
        {step === "select-time" && (
          <SelectTimeStep
            locationSlug={locationSlug}
            duration={duration}
            onSelect={(date, slot) => { setSelectedDate(date); setSelectedSlot(slot); goTo("details"); }}
          />
        )}
        {step === "details" && (
          <DetailsStep client={client} onChange={setClient} onNext={() => goTo("confirm")} />
        )}
        {step === "confirm" && selectedSlot && (
          <ConfirmStep
            locationName={locationName}
            typeName={typeName}
            duration={duration}
            price={price}
            slot={selectedSlot}
            client={client}
            booking={booking}
            error={bookingError}
            onConfirm={confirmBooking}
          />
        )}
      </div>
    </>
  );
}

// ─── Select time ──────────────────────────────────────────────────────────────

function SelectTimeStep({
  locationSlug, duration, onSelect,
}: {
  locationSlug: string;
  duration: number;
  onSelect: (date: string, slot: TimeSlot) => void;
}) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadMonth = useCallback(async (month: Date) => {
    setLoadingDates(true);
    const res = await fetch(`/api/availability/dates?location=${locationSlug}&month=${format(month, "yyyy-MM")}&duration=${duration}`);
    const { dates } = await res.json();
    setAvailableDates(new Set(dates ?? []));
    setLoadingDates(false);
  }, [locationSlug, duration]);

  useEffect(() => { loadMonth(viewMonth); }, [viewMonth, loadMonth]);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSlots([]);
    fetch(`/api/availability/slots?location=${locationSlug}&date=${selectedDate}&duration=${duration}`)
      .then((r) => r.json())
      .then(({ slots }) => { setSlots(slots ?? []); setLoadingSlots(false); });
  }, [selectedDate, locationSlug, duration]);

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const startDow = getDay(startOfMonth(viewMonth));
  const today = startOfDay(new Date());
  const canGoPrev = !isBefore(startOfMonth(subMonths(viewMonth, 1)), startOfMonth(today));

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-0 md:gap-6">
        <div className="md:w-64 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setViewMonth((m) => subMonths(m, 1))} disabled={!canGoPrev}
              className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 text-stone-600">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-stone-800">{format(viewMonth, "MMMM yyyy")}</span>
            <button onClick={() => setViewMonth((m) => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-stone-400 py-1">{d}</div>
            ))}
          </div>
          <div className={`grid grid-cols-7 gap-y-1 ${loadingDates ? "opacity-50" : ""}`}>
            {Array(startDow).fill(null).map((_, i) => <div key={`p-${i}`} />)}
            {days.map((day) => {
              const ds = format(day, "yyyy-MM-dd");
              const isPast = isBefore(day, today);
              const isAvail = availableDates.has(ds);
              const isSel = ds === selectedDate;
              return (
                <button key={ds} disabled={isPast || !isAvail}
                  onClick={() => isAvail && !isPast && setSelectedDate(ds)}
                  className={[
                    "aspect-square rounded-lg text-sm font-medium transition-colors mx-0.5",
                    isPast || !isAvail ? "text-stone-300 cursor-not-allowed" : "",
                    isAvail && !isPast && !isSel ? "text-stone-800 hover:bg-amber-100 hover:text-amber-800" : "",
                    isSel ? "bg-amber-500 text-white" : "",
                    isSameDay(day, new Date()) && !isSel ? "ring-1 ring-amber-400" : "",
                  ].join(" ")}>
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
        <div className="hidden md:block w-px bg-stone-100 self-stretch" />
        <div className="md:hidden h-px bg-stone-100 my-4" />
        <div className="flex-1 min-w-0">
          {!selectedDate ? (
            <div className="flex items-center justify-center h-full py-8">
              <p className="text-sm text-stone-400">Select a date to see available times</p>
            </div>
          ) : loadingSlots ? (
            <div className="flex items-center justify-center h-full py-8">
              <p className="text-sm text-stone-400">Loading times…</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="flex items-center justify-center h-full py-8">
              <p className="text-sm text-stone-400">No times available on this date</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
                {format(parseISO(selectedDate), "EEE d MMMM")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => (
                  <button key={slot.start} onClick={() => onSelect(selectedDate, slot)}
                    className="py-2.5 text-sm font-medium text-stone-700 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-500 hover:text-white active:scale-95 transition-all">
                    {slot.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Details ──────────────────────────────────────────────────────────────────

function DetailsStep({ client, onChange, onNext }: { client: ClientData; onChange: (c: ClientData) => void; onNext: () => void }) {
  function update(field: keyof ClientData, value: string) {
    onChange({ ...client, [field]: value });
  }
  const valid = client.first_name.trim() && client.last_name.trim() && client.email.trim().includes("@");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (valid) onNext(); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" value={client.first_name} onChange={(e) => update("first_name", e.target.value)} autoComplete="given-name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" value={client.last_name} onChange={(e) => update("last_name", e.target.value)} autoComplete="family-name" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={client.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" inputMode="email" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone <span className="text-stone-400 font-normal">(optional)</span></Label>
        <Input id="phone" type="tel" value={client.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" inputMode="tel" />
      </div>
      <Button type="submit" className="w-full mt-2" disabled={!valid}>Continue</Button>
    </form>
  );
}

// ─── Confirm ──────────────────────────────────────────────────────────────────

function ConfirmStep({
  locationName, typeName, duration, price, slot, client, booking, error, onConfirm,
}: {
  locationName: string; typeName: string; duration: number; price: number;
  slot: TimeSlot; client: ClientData; booking: boolean; error: string; onConfirm: () => void;
}) {
  const slotDate = parseISO(slot.start);
  const slotEnd = new Date(slotDate.getTime() + duration * 60 * 1000);
  const timeLabel = `${format(slotDate, "h:mm")}–${format(slotEnd, "h:mm a")}`;
  const dateLabel = format(slotDate, "EEEE d MMMM yyyy");

  return (
    <div className="space-y-4">
      <div className="bg-stone-50 rounded-xl p-4 space-y-2.5 text-sm border border-stone-100">
        <Row label="Service" value={typeName} />
        <Row label="Location" value={locationName} />
        <Row label="Date" value={dateLabel} />
        <Row label="Time" value={timeLabel} />
        <Row label="Duration" value={`${duration} min`} />
        {price > 0 && <Row label="Fee" value={`$${price}`} />}
        <div className="border-t border-stone-200 pt-2.5 mt-1">
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
