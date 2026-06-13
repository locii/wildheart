"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, format, isBefore, startOfDay, isSameDay, parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimeSlot { start: string; end: string; label: string }

export function SelectTimePicker({
  locationSlug,
  typeSlug,
  duration,
}: {
  locationSlug: string;
  typeSlug: string;
  duration: number;
}) {
  const router = useRouter();
  const [viewMonth, setViewMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadMonth = useCallback(async (month: Date) => {
    setLoadingDates(true);
    const res = await fetch(
      `/api/availability/dates?location=${locationSlug}&month=${format(month, "yyyy-MM")}&duration=${duration}`
    );
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

  function selectSlot(slot: TimeSlot) {
    const params = new URLSearchParams({ date: selectedDate, slot: slot.start });
    router.push(`/appointments/${locationSlug}/${typeSlug}/details?${params}`);
  }

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const startDow = getDay(startOfMonth(viewMonth));
  const today = startOfDay(new Date());
  const canGoPrev = !isBefore(startOfMonth(subMonths(viewMonth, 1)), startOfMonth(today));

  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-6">
      {/* Calendar */}
      <div className="md:w-64 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            disabled={!canGoPrev}
            className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 text-stone-600"
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
        <div className={`grid grid-cols-7 gap-y-1 ${loadingDates ? "opacity-50" : ""}`}>
          {Array(startDow).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isPast = isBefore(day, today);
            const isAvailable = availableDates.has(dateStr);
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={dateStr}
                onClick={() => isAvailable && !isPast && setSelectedDate(dateStr)}
                disabled={isPast || !isAvailable}
                className={[
                  "aspect-square rounded-lg text-sm font-medium transition-colors mx-0.5",
                  isPast ? "text-stone-300 cursor-not-allowed" : "",
                  !isPast && !isAvailable ? "text-stone-300 cursor-not-allowed" : "",
                  isAvailable && !isPast && !isSelected ? "text-stone-800 hover:bg-amber-100 hover:text-amber-800" : "",
                  isSelected ? "bg-amber-500 text-white" : "",
                  isSameDay(day, new Date()) && !isSelected ? "ring-1 ring-amber-400" : "",
                ].join(" ")}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block w-px bg-stone-100 self-stretch" />
      <div className="md:hidden h-px bg-stone-100 my-4" />

      {/* Slots */}
      <div className="flex-1 min-w-0">
        {!selectedDate ? (
          <div className="h-full flex items-center justify-center py-8">
            <p className="text-sm text-stone-400">Select a date to see available times</p>
          </div>
        ) : loadingSlots ? (
          <div className="h-full flex items-center justify-center py-8">
            <p className="text-sm text-stone-400">Loading times…</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="h-full flex items-center justify-center py-8">
            <p className="text-sm text-stone-400">No times available on this date</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
              {format(parseISO(selectedDate), "EEE d MMMM")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  onClick={() => selectSlot(slot)}
                  className="py-2.5 text-sm font-medium text-stone-700 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-500 hover:text-white active:scale-95 transition-all"
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
