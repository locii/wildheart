"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  format, addDays, addMonths, parse, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  parseISO, isToday, startOfDay,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { locationColor } from "@/lib/location-colors";
import { AppointmentSheet } from "@/components/admin/AppointmentSheet";
import { ChevronLeft, ChevronRight, Search, X, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type {
  Location, AppointmentType, Client,
  AppointmentWithRelations, AvailabilityOverride,
} from "@/lib/supabase/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const TZ = "Australia/Melbourne";
const START_HOUR = 7;
const END_HOUR = 21;
const SLOT_MIN = 15;
const SLOT_H = 20;           // px per 15-min slot
const HOUR_H = SLOT_H * 4;  // 80px per hour
const GRID_H = (END_HOUR - START_HOUR) * HOUR_H; // 1120px
const TIME_W = 48;           // time gutter width px
const MAX_SCROLL_H = 620;    // visible scroll height px
const DRAG_THRESHOLD = 4;    // px before drag starts (distinguishes click from drag)

function locColor(locations: Location[], slug: string): string {
  return locationColor(locations, slug);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalEvent {
  id: string;
  title: string;
  start: string; // UTC ISO
  end: string;   // UTC ISO
  color: string;
  textColor?: string;
  kind: "appointment" | "block";
  locationSlug?: string;
  typeName?: string;
  price?: number;
  overrideId?: string;
  locationId?: string;
  groupIds?: string[]; // all override IDs when multiple locations share a block
  date?: string;
  startTime?: string | null;
  endTime?: string | null;
  notes?: string;
  allDay?: boolean;
  repeatWeekly?: boolean;
}

interface PositionedEvent extends CalEvent {
  top: number;
  height: number;
  track: number;
  numTracks: number;
}

interface Selection { start: Date; end: Date }
interface BlockEdit {
  id: string; groupIds: string[]; locationId: string; date: string; allDay: boolean;
  startTime: string; endTime: string; notes: string; repeatWeekly: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, "0"); }

function toMelb(utcIso: string): Date {
  return toZonedTime(parseISO(utcIso), TZ);
}

function layoutEventsForDay(events: CalEvent[], day: Date): PositionedEvent[] {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = dayStart + 86400000;

  const visible = events.filter((ev) => {
    const s = parseISO(ev.start).getTime();
    const e = parseISO(ev.end).getTime();
    return s < dayEnd && e > dayStart;
  });

  const sorted = [...visible].sort(
    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime(),
  );

  // Assign tracks greedily
  const trackEnds: number[] = [];
  const assigned: PositionedEvent[] = [];

  for (const ev of sorted) {
    const zs = toMelb(ev.start);
    const ze = toMelb(ev.end);
    const minsFromTop = zs.getHours() * 60 + zs.getMinutes() - START_HOUR * 60;
    const top = (minsFromTop / SLOT_MIN) * SLOT_H;
    const durationMins = (ze.getTime() - zs.getTime()) / 60000;
    const height = Math.max(SLOT_H, (durationMins / SLOT_MIN) * SLOT_H);
    const startMs = parseISO(ev.start).getTime();
    const endMs = parseISO(ev.end).getTime();

    let track = trackEnds.findIndex((end) => startMs >= end);
    if (track === -1) { track = trackEnds.length; trackEnds.push(endMs); }
    else trackEnds[track] = endMs;

    assigned.push({ ...ev, top, height, track, numTracks: 0 });
  }

  // Compute numTracks per event (concurrent tracks at any moment during the event)
  for (const ev of assigned) {
    const s = parseISO(ev.start).getTime();
    const e = parseISO(ev.end).getTime();
    const concurrentTracks = new Set<number>();
    for (const other of assigned) {
      const os = parseISO(other.start).getTime();
      const oe = parseISO(other.end).getTime();
      if (os < e && oe > s) concurrentTracks.add(other.track);
    }
    ev.numTracks = concurrentTracks.size || 1;
  }

  return assigned;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ScheduleCalendar({
  locations,
  types,
  actions,
}: {
  locations: Location[];
  types: AppointmentType[];
  actions?: React.ReactNode;
}) {
  const searchParams = useSearchParams();

  const [view, setView] = useState<"month" | "week" | "day">(() => {
    const v = searchParams.get("calview");
    return (["month", "week", "day"] as const).includes(v as "month") ? (v as "month" | "week" | "day") : "week";
  });
  const [anchorDate, setAnchorDate] = useState(() => {
    const d = searchParams.get("date");
    if (d) { try { return parse(d, "yyyy-MM-dd", new Date()); } catch {} }
    return new Date();
  });
  const [liveLocations, setLiveLocations] = useState<Location[]>(locations);
  const [locationFilter, setLocationFilter] = useState<"all" | string>("all");
  const [events, setEvents] = useState<CalEvent[]>([]);

  // Re-fetch locations so colour edits are reflected without a full page reload
  useEffect(() => {
    fetch("/api/locations")
      .then(r => r.json())
      .then(({ locations: fresh }) => { if (fresh) setLiveLocations(fresh); });
  }, []);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [editingBlock, setEditingBlock] = useState<BlockEdit | null>(null);
  const [flyoutApptId, setFlyoutApptId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => anchorDate.getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("calview", view);
    params.set("date", format(anchorDate, "yyyy-MM-dd"));
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [view, anchorDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = useMemo(() => {
    if (view === "day") return [anchorDate];
    if (view === "month") {
      return eachDayOfInterval({
        start: startOfWeek(startOfMonth(anchorDate), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(anchorDate), { weekStartsOn: 1 }),
      });
    }
    const ws = startOfWeek(anchorDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  }, [view, anchorDate]);

  const fetchEvents = useCallback(async () => {
    const from = startOfDay(days[0]).toISOString();
    const to = addDays(startOfDay(days[days.length - 1]), 1).toISOString();

    const [apptRes, blockRes] = await Promise.all([
      fetch(`/api/appointments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
      fetch(`/api/availability/overrides?locationId=all`),
    ]);

    const { appointments } = await apptRes.json() as { appointments: AppointmentWithRelations[] };
    const { overrides } = await blockRes.json() as { overrides: AvailabilityOverride[] };

    const apptEvents: CalEvent[] = (appointments ?? [])
      .filter((a) => locationFilter === "all" || a.location.slug === locationFilter)
      .map((a) => ({
        id: `appt-${a.id}`,
        title: `${a.client.first_name} ${a.client.last_name}`,
        start: a.start_at,
        end: a.end_at,
        color: locColor(liveLocations, a.location.slug),
        kind: "appointment" as const,
        locationSlug: a.location.slug,
        typeName: a.type.name,
        price: a.type.price,
      }));

    const rangeStart = new Date(from);
    const rangeEnd = new Date(to);

    // Filter overrides relevant to the current location filter
    const relevantOverrides = (overrides ?? []).filter((o) => {
      const loc = locations.find((l) => l.id === o.location_id);
      return locationFilter === "all" || loc?.slug === locationFilter;
    });

    // Group by (date, start_time, end_time) to collapse "all locations" blocks into one
    const overrideGroups = new Map<string, typeof relevantOverrides>();
    for (const o of relevantOverrides) {
      const key = `${o.date}|${o.start_time ?? ""}|${o.end_time ?? ""}`;
      const g = overrideGroups.get(key) ?? [];
      g.push(o);
      overrideGroups.set(key, g);
    }

    const blockEvents: CalEvent[] = [];
    for (const group of overrideGroups.values()) {
      const o = group[0];
      const groupIds = group.map((g) => g.id);
      const isMultiLocation = group.length > 1;
      const loc = locations.find((l) => l.id === o.location_id);
      const startTime = o.start_time ?? "00:00:00";
      const endTime = o.end_time ?? "23:59:00";

      // Expand repeat_weekly across visible days matching the same weekday
      const baseDate = new Date(`${o.date}T12:00:00`);
      const targetDay = baseDate.getDay();
      const datesToRender: string[] = [];

      if (o.repeat_weekly) {
        let cur = new Date(rangeStart);
        while (cur <= rangeEnd) {
          const curStr = format(cur, "yyyy-MM-dd");
          if (cur.getDay() === targetDay && curStr >= o.date) datesToRender.push(curStr);
          cur = addDays(cur, 1);
        }
      } else {
        datesToRender.push(o.date);
      }

      for (const dateStr of datesToRender) {
        const eventStart = fromZonedTime(new Date(`${dateStr}T${startTime}`), TZ);
        const eventEnd = fromZonedTime(new Date(`${dateStr}T${endTime}`), TZ);
        if (eventEnd < rangeStart || eventStart > rangeEnd) continue;
        blockEvents.push({
          id: `block-${o.id}-${dateStr}`,
          title: o.notes ? `Blocked · ${o.notes}` : "Blocked",
          start: eventStart.toISOString(),
          end: eventEnd.toISOString(),
          color: `var(--color-blocked)`,
          textColor: "oklch(0.60 0 0)",
          kind: "block" as const,
          overrideId: o.id,
          groupIds: isMultiLocation ? groupIds : undefined,
          locationId: o.location_id,
          locationSlug: isMultiLocation ? "" : (loc?.slug ?? ""),
          date: dateStr,
          startTime: o.start_time,
          endTime: o.end_time,
          notes: o.notes ?? "",
          allDay: !o.start_time,
          repeatWeekly: o.repeat_weekly,
        });
      }
    }

    setEvents([...apptEvents, ...blockEvents]);
  }, [days, locationFilter, liveLocations]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    if (!pickerOpen) return;
    function onDown(e: MouseEvent) {
      if (
        pickerRef.current?.contains(e.target as Node) ||
        pickerBtnRef.current?.contains(e.target as Node)
      ) return;
      setPickerOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [pickerOpen]);

  function openPicker() {
    setPickerYear(anchorDate.getFullYear());
    setPickerOpen((o) => !o);
  }

  function nav(dir: -1 | 1) {
    if (view === "month") setAnchorDate((d) => addMonths(d, dir));
    else setAnchorDate((d) => addDays(d, dir * (view === "week" ? 7 : 1)));
  }

  function handleMonthDayClick(day: Date) {
    const dateStr = format(day, "yyyy-MM-dd");
    setSelection({
      start: fromZonedTime(new Date(`${dateStr}T09:00:00`), TZ),
      end: fromZonedTime(new Date(`${dateStr}T10:00:00`), TZ),
    });
  }

  async function handleEventDrop(ev: CalEvent, newStartUtc: Date, newEndUtc: Date) {
    if (ev.kind === "appointment") {
      const rawId = ev.id.replace("appt-", "");
      const res = await fetch(`/api/appointments/${rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_at: newStartUtc.toISOString(), end_at: newEndUtc.toISOString() }),
      });
      if (!res.ok) alert("Could not reschedule — the slot may be taken.");
    } else {
      const newStartMelb = toZonedTime(newStartUtc, TZ);
      const newEndMelb = toZonedTime(newEndUtc, TZ);
      await fetch(`/api/availability/overrides/${ev.overrideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(newStartMelb, "yyyy-MM-dd"),
          start_time: format(newStartMelb, "HH:mm:ss"),
          end_time: format(newEndMelb, "HH:mm:ss"),
        }),
      });
    }
    fetchEvents();
  }

  function handleEventClick(ev: CalEvent) {
    if (ev.kind === "appointment") {
      setFlyoutApptId(ev.id.replace("appt-", ""));
    } else {
      setEditingBlock({
        id: ev.overrideId!,
        groupIds: ev.groupIds ?? [ev.overrideId!],
        locationId: ev.locationId!,
        date: ev.date!,
        allDay: ev.allDay ?? false,
        startTime: (ev.startTime ?? "09:00").substring(0, 5),
        endTime: (ev.endTime ?? "17:00").substring(0, 5),
        notes: ev.notes ?? "",
        repeatWeekly: ev.repeatWeekly ?? false,
      });
    }
  }

  function handleSelect(start: Date, end: Date) {
    setSelection({ start, end });
  }

  const title = view === "month"
    ? format(anchorDate, "MMMM yyyy")
    : view === "week"
      ? `${format(days[0], "d MMM")} – ${format(days[6], "d MMM yyyy")}`
      : format(anchorDate, "EEEE, d MMMM yyyy");

  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        <FilterChip active={locationFilter === "all"} onClick={() => setLocationFilter("all")}>
          All locations
        </FilterChip>
        {liveLocations.map((l) => (
          <FilterChip key={l.slug} active={locationFilter === l.slug} onClick={() => setLocationFilter(l.slug)}>
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: locColor(liveLocations, l.slug) }} />
            {l.name}
          </FilterChip>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={() => nav(-1)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setAnchorDate(new Date())}
            className="px-2.5 py-1 text-xs rounded-lg bg-muted/50 hover:bg-muted font-medium transition-colors"
          >
            Today
          </button>
          <button onClick={() => nav(1)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="relative ml-2 hidden sm:block">
            <button
              ref={pickerBtnRef}
              onClick={openPicker}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {title}
            </button>
            {pickerOpen && (
              <div
                ref={pickerRef}
                className="absolute top-full left-0 mt-1.5 z-50 bg-card border rounded-xl shadow-lg p-3 w-52"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <button
                    onClick={() => setPickerYear((y) => y - 1)}
                    className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-semibold">{pickerYear}</span>
                  <button
                    onClick={() => setPickerYear((y) => y + 1)}
                    className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, idx) => {
                    const isActive = pickerYear === anchorDate.getFullYear() && idx === anchorDate.getMonth();
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setAnchorDate(new Date(pickerYear, idx, 1));
                          setPickerOpen(false);
                        }}
                        className={`py-1.5 text-xs rounded-lg font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted/60 text-foreground"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-muted/50 rounded-lg p-0.5">
            {(["month", "week", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors capitalize ${view === v ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                {v}
              </button>
            ))}
          </div>
          {actions}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-card border rounded-xl overflow-hidden">
        {view === "month" ? (
          <MonthGrid
            days={days}
            anchorDate={anchorDate}
            events={events}
            onEventClick={handleEventClick}
            onDayClick={handleMonthDayClick}
            onDayNumberClick={(day) => { setAnchorDate(day); setView("day"); }}
          />
        ) : (
          <TimeGrid
            days={days}
            events={events}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
            onSelect={handleSelect}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        {liveLocations.map((l) => (
          <span key={l.slug} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: locColor(liveLocations, l.slug) }} />
            {l.name}
          </span>
        ))}
      </div>

      {selection && (
        <CreateDialog
          selection={selection}
          locations={liveLocations}
          types={types}
          onClose={() => setSelection(null)}
          onCreated={() => { setSelection(null); fetchEvents(); }}
        />
      )}

      {editingBlock && (
        <EditBlockDialog
          block={editingBlock}
          locations={liveLocations}
          onClose={() => setEditingBlock(null)}
          onSaved={() => { setEditingBlock(null); fetchEvents(); }}
        />
      )}

      <AppointmentSheet
        appointmentId={flyoutApptId}
        onClose={() => setFlyoutApptId(null)}
        onChanged={() => fetchEvents()}
      />
    </div>
  );
}

// ─── TimeGrid ─────────────────────────────────────────────────────────────────

const HOUR_LABELS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
  const h = START_HOUR + i;
  return h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
});

interface DragRef {
  eventId: string;
  origStart: string;
  origEnd: string;
  startY: number;
  origColIndex: number;
  moved: boolean;
}

interface SelectRef {
  colIndex: number;
  startSlot: number;
  endSlot: number;
}

function TimeGrid({
  days,
  events,
  onEventClick,
  onEventDrop,
  onSelect,
}: {
  days: Date[];
  events: CalEvent[];
  onEventClick: (ev: CalEvent) => void;
  onEventDrop: (ev: CalEvent, newStart: Date, newEnd: Date) => void;
  onSelect: (start: Date, end: Date) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragRef | null>(null);
  const selectRef = useRef<SelectRef | null>(null);
  const [dragging, setDragging] = useState<{ id: string; origColIndex: number; targetColIndex: number; deltaSlots: number } | null>(null);
  const [selecting, setSelecting] = useState<SelectRef | null>(null);
  const [nowY, setNowY] = useState<number | null>(null);

  // Now indicator
  useEffect(() => {
    function tick() {
      const now = toZonedTime(new Date(), TZ);
      const mins = now.getHours() * 60 + now.getMinutes() - START_HOUR * 60;
      setNowY(mins >= 0 && mins <= (END_HOUR - START_HOUR) * 60 ? (mins / SLOT_MIN) * SLOT_H : null);
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (!scrollRef.current || nowY === null) return;
    scrollRef.current.scrollTop = Math.max(0, nowY - 120);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function getGridY(clientY: number): number {
    if (!scrollRef.current) return 0;
    return clientY - scrollRef.current.getBoundingClientRect().top + scrollRef.current.scrollTop;
  }

  function getColIndex(clientX: number): number {
    if (!scrollRef.current) return 0;
    const rect = scrollRef.current.getBoundingClientRect();
    const x = clientX - rect.left - TIME_W;
    const colW = (rect.width - TIME_W) / days.length;
    return Math.max(0, Math.min(days.length - 1, Math.floor(x / colW)));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const eventEl = target.closest<HTMLElement>("[data-eid]");

    if (eventEl) {
      const eid = eventEl.dataset.eid!;
      const origColIndex = getColIndex(e.clientX);
      dragRef.current = { eventId: eid, origStart: eventEl.dataset.start!, origEnd: eventEl.dataset.end!, startY: e.clientY, origColIndex, moved: false };
      scrollRef.current?.setPointerCapture(e.pointerId);
    } else {
      e.preventDefault();
      const y = getGridY(e.clientY);
      const slot = Math.max(0, Math.floor(y / SLOT_H));
      const colIndex = getColIndex(e.clientX);
      selectRef.current = { colIndex, startSlot: slot, endSlot: slot + 1 };
      setSelecting({ colIndex, startSlot: slot, endSlot: slot + 1 });
      scrollRef.current?.setPointerCapture(e.pointerId);
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current) {
      const deltaY = e.clientY - dragRef.current.startY;
      if (!dragRef.current.moved && Math.abs(deltaY) < DRAG_THRESHOLD) return;
      dragRef.current.moved = true;
      const deltaSlots = Math.round(deltaY / SLOT_H);
      const targetColIndex = getColIndex(e.clientX);
      if (deltaSlots !== (dragging?.deltaSlots ?? 0) || targetColIndex !== (dragging?.targetColIndex ?? dragRef.current.origColIndex)) {
        setDragging({ id: dragRef.current.eventId, origColIndex: dragRef.current.origColIndex, targetColIndex, deltaSlots });
      }
    } else if (selectRef.current) {
      const y = getGridY(e.clientY);
      const endSlot = Math.max(selectRef.current.startSlot + 1, Math.ceil(y / SLOT_H));
      if (endSlot !== selectRef.current.endSlot) {
        selectRef.current.endSlot = endSlot;
        setSelecting({ ...selectRef.current });
      }
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current) {
      const { eventId, origStart, origEnd, moved } = dragRef.current;
      const deltaSlots = dragging?.deltaSlots ?? 0;

      const targetColIndex = dragging?.targetColIndex ?? dragRef.current?.origColIndex ?? 0;
      const origColIndex = dragRef.current?.origColIndex ?? 0;
      const deltaCol = targetColIndex - origColIndex;

      if (moved && (deltaSlots !== 0 || deltaCol !== 0)) {
        const ev = events.find((ev) => ev.id === eventId);
        if (ev) {
          const deltaMs = deltaSlots * SLOT_MIN * 60000 + deltaCol * 86400000;
          onEventDrop(
            ev,
            new Date(parseISO(origStart).getTime() + deltaMs),
            new Date(parseISO(origEnd).getTime() + deltaMs),
          );
        }
      } else if (!moved) {
        const ev = events.find((ev) => ev.id === eventId);
        if (ev) onEventClick(ev);
      }

      dragRef.current = null;
      setDragging(null);
    } else if (selectRef.current) {
      const { colIndex, startSlot, endSlot } = selectRef.current;
      if (endSlot > startSlot) {
        const day = days[colIndex];
        const startMins = START_HOUR * 60 + startSlot * SLOT_MIN;
        const endMins = START_HOUR * 60 + endSlot * SLOT_MIN;
        const dateStr = format(day, "yyyy-MM-dd");
        const startLocal = fromZonedTime(
          new Date(`${dateStr}T${pad(Math.floor(startMins / 60))}:${pad(startMins % 60)}:00`),
          TZ,
        );
        const endLocal = fromZonedTime(
          new Date(`${dateStr}T${pad(Math.floor(endMins / 60))}:${pad(endMins % 60)}:00`),
          TZ,
        );
        onSelect(startLocal, endLocal);
      }
      selectRef.current = null;
      setSelecting(null);
    }
  }

  function handlePointerCancel() {
    dragRef.current = null;
    selectRef.current = null;
    setDragging(null);
    setSelecting(null);
  }

  return (
    <div className="select-none">
      {/* Day headers */}
      <div className="flex border-b bg-card">
        <div style={{ width: TIME_W, flexShrink: 0 }} />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border-l ${isToday(day) ? "text-primary" : "text-muted-foreground"}`}
          >
            <span className="hidden sm:inline">{format(day, "EEE")}</span>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs tabular-nums ${isToday(day) ? "bg-primary text-primary-foreground font-semibold" : ""}`}>
              {format(day, "d")}
            </span>
          </div>
        ))}
      </div>

      {/* Scrollable grid */}
      <div
        ref={scrollRef}
        style={{ height: MAX_SCROLL_H, overflowY: "auto", touchAction: "pan-y" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className="flex" style={{ height: GRID_H }}>

          {/* Time gutter */}
          <div style={{ width: TIME_W, flexShrink: 0 }}>
            {HOUR_LABELS.map((label, i) => (
              <div
                key={label}
                className="flex items-start justify-end pr-2 border-b border-border/20"
                style={{ height: HOUR_H, paddingTop: 3 }}
              >
                <span className="text-[10px] text-muted-foreground/50 leading-none tabular-nums">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, colIndex) => {
            const positioned = layoutEventsForDay(events, day);
            const selOver = selecting?.colIndex === colIndex ? selecting : null;

            return (
              <div
                key={day.toISOString()}
                className={`flex-1 border-l relative ${isToday(day) ? "bg-primary/[0.025]" : ""}`}
                style={{ height: GRID_H }}
              >
                {/* Hour lines */}
                {HOUR_LABELS.map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-b border-border/20"
                    style={{ top: i * HOUR_H }}
                  />
                ))}
                {/* Half-hour lines */}
                {HOUR_LABELS.map((_, i) => (
                  <div
                    key={`h${i}`}
                    className="absolute left-0 right-0 border-b border-border/10"
                    style={{ top: i * HOUR_H + HOUR_H / 2 }}
                  />
                ))}

                {/* Events */}
                {positioned.map((ev) => {
                  const isDragging = dragging?.id === ev.id;
                  const isCrossDay = isDragging && dragging!.targetColIndex !== colIndex;
                  // Cross-day drag: show ghost in target column, dim here
                  const top = isDragging && !isCrossDay ? ev.top + dragging!.deltaSlots * SLOT_H : ev.top;
                  const pct = 96 / ev.numTracks;
                  const leftPct = ev.track * pct + 1;

                  return (
                    <div
                      key={ev.id}
                      data-eid={ev.id}
                      data-start={ev.start}
                      data-end={ev.end}
                      className={`absolute rounded-md overflow-hidden cursor-pointer ${isDragging ? "z-30 shadow-lg" : "z-10"}`}
                      style={{
                        top,
                        height: ev.height,
                        left: `${leftPct}%`,
                        width: `${pct}%`,
                        backgroundColor: ev.color,
                        border: `1px solid ${ev.color}bb`,
                        opacity: isCrossDay ? 0.25 : isDragging ? 0.7 : 1,
                      }}
                    >
                      {ev.kind === "block" ? (
                        <div className="px-1.5 py-0.5 text-[10px] leading-tight" style={{ color: ev.textColor ?? "#9ca3af" }}>
                          <div className="truncate">{ev.title}</div>
                          {ev.notes && ev.height > SLOT_H * 2 && (
                            <div className="mt-0.5 opacity-75 line-clamp-3">{ev.notes}</div>
                          )}
                        </div>
                      ) : (
                        <div className="px-1.5 py-0.5">
                          <div className={`font-semibold truncate text-white leading-tight ${ev.height <= SLOT_H * 2 ? "text-[11px]" : "text-[12px]"}`}>
                            {ev.title}
                          </div>
                          {ev.height > SLOT_H * 2 && ev.typeName && (
                            <div className="text-[11px] text-white/80 truncate">{ev.typeName}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Cross-day drag ghost rendered in target column */}
                {dragging && dragging.targetColIndex === colIndex && dragging.origColIndex !== colIndex && (() => {
                  const draggedEv = events.find((ev) => ev.id === dragging.id);
                  if (!draggedEv) return null;
                  const zs = toMelb(draggedEv.start);
                  const ze = toMelb(draggedEv.end);
                  const minsFromTop = zs.getHours() * 60 + zs.getMinutes() - START_HOUR * 60;
                  const ghostTop = (minsFromTop / SLOT_MIN) * SLOT_H + dragging.deltaSlots * SLOT_H;
                  const ghostH = Math.max(SLOT_H, ((ze.getTime() - zs.getTime()) / 60000 / SLOT_MIN) * SLOT_H);
                  return (
                    <div
                      key="ghost"
                      className="absolute left-[1%] w-[96%] rounded-md overflow-hidden z-30 shadow-lg pointer-events-none"
                      style={{ top: ghostTop, height: ghostH, backgroundColor: draggedEv.color, border: `1px solid ${draggedEv.color}bb`, opacity: 0.85 }}
                    >
                      <div className="px-1.5 py-0.5">
                        <div className="text-[10px] font-semibold truncate text-white">{draggedEv.title}</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Selection overlay */}
                {selOver && (
                  <div
                    className="absolute left-[2%] right-[2%] rounded pointer-events-none z-20 bg-primary/15 border border-primary/50"
                    style={{
                      top: selOver.startSlot * SLOT_H,
                      height: (selOver.endSlot - selOver.startSlot) * SLOT_H,
                    }}
                  />
                )}

                {/* Now indicator */}
                {isToday(day) && nowY !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: nowY }}
                  >
                    <div className="absolute -left-1 w-2 h-2 rounded-full bg-primary -translate-y-1/2" />
                    <div className="absolute left-1 right-0 h-px bg-primary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MonthGrid ────────────────────────────────────────────────────────────────

const MONTH_DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_CELL_MAX = 3;

function MonthGrid({
  days,
  anchorDate,
  events,
  onEventClick,
  onDayClick,
  onDayNumberClick,
}: {
  days: Date[];
  anchorDate: Date;
  events: CalEvent[];
  onEventClick: (ev: CalEvent) => void;
  onDayClick: (day: Date) => void;
  onDayNumberClick: (day: Date) => void;
}) {
  // Chunk days into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div>
      {/* DOW headers */}
      <div className="grid grid-cols-7 border-b">
        {MONTH_DOW.map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-medium text-muted-foreground border-r last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day) => {
            const inMonth = isSameMonth(day, anchorDate);
            const today = isToday(day);

            // Events that touch this day
            const dayStart = startOfDay(day).getTime();
            const dayEnd = dayStart + 86400000;
            const dayEvents = events
              .filter((ev) => {
                const s = parseISO(ev.start).getTime();
                const e = parseISO(ev.end).getTime();
                return s < dayEnd && e > dayStart;
              })
              .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());

            const visible = dayEvents.slice(0, MONTH_CELL_MAX);
            const overflow = dayEvents.length - MONTH_CELL_MAX;

            return (
              <div
                key={day.toISOString()}
                className={`border-r border-b last:border-r-0 min-h-[88px] p-1 cursor-pointer group transition-colors hover:bg-muted/20 ${today ? "bg-primary/[0.04]" : ""} ${!inMonth ? "opacity-40" : ""}`}
                onClick={() => onDayClick(day)}
              >
                {/* Day number */}
                <div className="flex justify-end mb-1">
                  <span
                    className={`text-[11px] tabular-nums w-5 h-5 flex items-center justify-center rounded-full cursor-pointer transition-colors ${today ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted"}`}
                    onClick={(e) => { e.stopPropagation(); onDayNumberClick(day); }}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-0.5">
                  {visible.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate leading-tight cursor-pointer hover:brightness-110 transition-all"
                      style={{
                        backgroundColor: `${ev.color}28`,
                        color: ev.kind === "block" ? "var(--color-muted-foreground)" : ev.color,
                      }}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                      <span className="truncate">{ev.title}</span>
                    </div>
                  ))}
                  {overflow > 0 && (
                    <div className="text-[10px] text-muted-foreground/70 px-1">+{overflow} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Create dialog ────────────────────────────────────────────────────────────

function CreateDialog({
  selection, locations, types, onClose, onCreated,
}: {
  selection: Selection;
  locations: Location[];
  types: AppointmentType[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [tab, setTab] = useState<"book" | "block">("book");
  const timeLabel = `${format(selection.start, "EEE d MMM, h:mm a")} – ${format(selection.end, "h:mm a")}`;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg mx-4">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-muted-foreground">{timeLabel}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <TabBtn active={tab === "book"} onClick={() => setTab("book")}>Book appointment</TabBtn>
          <TabBtn active={tab === "block"} onClick={() => setTab("block")}>Block time</TabBtn>
        </div>
        {tab === "book" && (
          <BookTab selection={selection} types={types} locations={locations} onCreated={onCreated} onClose={onClose} />
        )}
        {tab === "block" && (
          <BlockTab selection={selection} locations={locations} onCreated={onCreated} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit block dialog ────────────────────────────────────────────────────────

function EditBlockDialog({
  block, locations, onClose, onSaved,
}: {
  block: BlockEdit;
  locations: Location[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [startTime, setStartTime] = useState(block.startTime.substring(0, 5));
  const [endTime, setEndTime] = useState(block.endTime.substring(0, 5));
  const [notes, setNotes] = useState(block.notes);
  const [allDay, setAllDay] = useState(block.allDay);
  const [repeatWeekly, setRepeatWeekly] = useState(block.repeatWeekly);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isGrouped = block.groupIds.length > 1;
  const loc = locations.find((l) => l.id === block.locationId);

  async function save() {
    setSaving(true);
    const body = JSON.stringify({
      start_time: allDay ? null : startTime + ":00",
      end_time: allDay ? null : endTime + ":00",
      notes: notes || null,
      repeat_weekly: repeatWeekly,
    });
    await Promise.all(block.groupIds.map((id) =>
      fetch(`/api/availability/overrides/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body,
      })
    ));
    onSaved();
  }

  async function deleteBlock() {
    setDeleting(true);
    await Promise.all(block.groupIds.map((id) =>
      fetch(`/api/availability/overrides/${id}`, { method: "DELETE" })
    ));
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg mx-4">
        <DialogHeader>
          <DialogTitle>Edit block</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg px-3 py-2.5 text-sm space-y-0.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {isGrouped ? "All locations" : (loc?.name ?? "Unknown location")} · {format(parseISO(block.date), "EEE d MMM yyyy")}
              {repeatWeekly && (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 rounded px-1.5 py-0.5 ml-auto">Weekly</span>
              )}
            </div>
            {notes && <p className="text-xs text-foreground pt-0.5">{notes}</p>}
          </div>

          <button onClick={() => setAllDay((v) => !v)} className="flex items-center gap-3 w-full">
            <span className={`w-10 h-6 rounded-full flex items-center transition-colors shrink-0 ${allDay ? "bg-primary" : "bg-border"}`}>
              <span className={`w-4 h-4 bg-card rounded-full shadow mx-1 transition-transform ${allDay ? "translate-x-4" : ""}`} />
            </span>
            <span className="text-sm">All day</span>
          </button>

          {!allDay && (
            <div className="flex items-center gap-2">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 text-sm bg-input border border-border rounded-lg px-3 py-2 text-foreground" />
              <span className="text-muted-foreground">–</span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 text-sm bg-input border border-border rounded-lg px-3 py-2 text-foreground" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Conference, Annual leave…" rows={2} />
          </div>

          <button onClick={() => setRepeatWeekly((v) => !v)} className="flex items-center gap-3 w-full">
            <span className={`w-10 h-6 rounded-full flex items-center transition-colors shrink-0 ${repeatWeekly ? "bg-primary" : "bg-border"}`}>
              <span className={`w-4 h-4 bg-card rounded-full shadow mx-1 transition-transform ${repeatWeekly ? "translate-x-4" : ""}`} />
            </span>
            <div className="text-left">
              <div className="text-sm">Repeat weekly</div>
              <div className="text-xs text-muted-foreground">Blocks every {format(parseISO(block.date), "EEEE")}</div>
            </div>
          </button>

          <div className="flex gap-2 pt-1">
            <Button onClick={save} disabled={saving} className="flex-1" size="sm">
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={deleteBlock} disabled={deleting}
              className="text-red-500 hover:text-red-400 hover:border-red-500/50">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Book tab ─────────────────────────────────────────────────────────────────

function BookTab({ selection, types, locations, onCreated, onClose }: {
  selection: Selection;
  types: AppointmentType[];
  locations: Location[];
  onCreated: () => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [newClient, setNewClient] = useState({ first_name: "", last_name: "", phone: "", email: "" });
  const [typeId, setTypeId] = useState(types[0]?.id ?? "");
  const [locationSlug, setLocationSlug] = useState(locations[0]?.slug ?? "");
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/clients?q=${encodeURIComponent(q)}`);
      const { clients } = await res.json();
      setResults(clients ?? []);
    }, 250);
  }, [q]);

  const hasClient = isNew
    ? !!(newClient.first_name && newClient.last_name && newClient.email.includes("@"))
    : !!selectedClient;

  async function book() {
    setSaving(true);
    setError("");
    const client = isNew ? newClient : {
      first_name: selectedClient!.first_name,
      last_name: selectedClient!.last_name,
      phone: selectedClient!.phone ?? "",
      email: selectedClient!.email,
    };
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationSlug, typeId,
        start: selection.start.toISOString(),
        client, source: "admin", scheduledBy: "admin",
        quiet: !notify,
      }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Failed"); setSaving(false); return; }
    onCreated();
  }

  return (
    <div className="space-y-3 pt-1">
      <div className="space-y-1.5 mb-6">
        <Label className="text-xs">Client</Label>
        {selectedClient ? (
          <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-xs">
            <span className="font-medium">{selectedClient.first_name} {selectedClient.last_name}</span>
            <button onClick={() => setSelectedClient(null)}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
          </div>
        ) : isNew ? (
          <div className="space-y-2">
            <button onClick={() => setIsNew(false)} className="flex items-center gap-1 text-xs text-muted-foreground">
              <X className="h-3 w-3" /> Cancel
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="First name oo" value={newClient.first_name} onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })} className="h-8 text-xs" />
              <Input placeholder="Last name" value={newClient.last_name} onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })} className="h-8 text-xs" />
            </div>
            <Input placeholder="Email" type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="h-8 text-xs" />
            <Input placeholder="Phone (optional)" type="tel" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="h-8 text-xs" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search client…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-8 text-xs" autoFocus />
            </div>
            {results.map((c) => (
              <button key={c.id} onClick={() => { setSelectedClient(c); setQ(""); setResults([]); }}
                className="w-full text-left px-3 py-2 text-xs border rounded-lg hover:bg-muted/50">
                <span className="font-medium">{c.first_name} {c.last_name}</span>
                <span className="text-muted-foreground ml-2">{c.email}</span>
              </button>
            ))}
            {q.trim() && results.length === 0 && (
              <button onClick={() => setIsNew(true)}
                className="w-full text-xs text-primary border border-dashed rounded-lg py-2 hover:border-primary/70">
                + Create new client
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1.5 mb-6">
        <Label className="text-xs">Location</Label>
        <div className="grid grid-cols-2 gap-2">
          {locations.map((l) => (
            <button key={l.slug} onClick={() => setLocationSlug(l.slug)}
              className={`p-2 text-xs rounded-lg border font-medium transition-colors ${locationSlug === l.slug ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground"}`}>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Service</Label>
        <div className="space-y-1">
          {types.map((t) => (
            <button key={t.id} onClick={() => setTypeId(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${typeId === t.id ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:border-border"}`}>
              {t.name} · {t.duration_minutes} min
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-gray-300 accent-primary"
        />
        <span className="text-xs text-muted-foreground">Send confirmation email &amp; SMS to client</span>
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button onClick={book} disabled={!hasClient || saving} className="flex-1 bg-chart-1 hover:bg-chart-1/85 text-white border-transparent" size="sm">
          {saving ? "Booking…" : "Book"}
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Block tab ────────────────────────────────────────────────────────────────

function BlockTab({ selection, locations, onCreated, onClose }: {
  selection: Selection;
  locations: Location[];
  onCreated: () => void;
  onClose: () => void;
}) {
  const [locationId, setLocationId] = useState<string>("all");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const date = format(selection.start, "yyyy-MM-dd");
  const startTime = format(selection.start, "HH:mm:ss");
  const endTime = format(selection.end, "HH:mm:ss");
  const isAllDay = startTime === "00:00:00" && endTime === "00:00:00";

  async function block() {
    setSaving(true);
    const targets = locationId === "all" ? locations.map((l) => l.id) : [locationId];
    await Promise.all(targets.map((lid) =>
      fetch("/api/availability/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: lid, date,
          allDay: isAllDay,
          startTime: isAllDay ? null : startTime,
          endTime: isAllDay ? null : endTime,
          repeatWeekly: false,
          notes: notes || null,
        }),
      })
    ));
    onCreated();
  }

  return (
    <div className="space-y-4 pt-1">
      <div className="space-y-1.5">
        <Label className="text-xs">Location</Label>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setLocationId("all")}
            className={`py-2.5 text-xs rounded-lg border font-medium transition-colors ${locationId === "all" ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground"}`}>
            All locations
          </button>
          {locations.map((l) => (
            <button key={l.id} onClick={() => setLocationId(l.id)}
              className={`py-2.5 text-xs rounded-lg border font-medium transition-colors flex items-center justify-center gap-1.5 ${locationId === l.id ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground"}`}>
              <MapPin className="h-3 w-3" />{l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg px-3 py-2.5 text-xs text-muted-foreground space-y-0.5">
        <div>{format(selection.start, "EEE d MMM yyyy")}</div>
        <div>{isAllDay ? "All day" : `${format(selection.start, "h:mm a")} – ${format(selection.end, "h:mm a")}`}</div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Conference, Annual leave…" rows={2} />
      </div>

      <div className="flex gap-2">
        <Button onClick={block} disabled={saving} className="flex-1" size="sm">
          {saving ? "Blocking…" : "Block this time"}
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:border-muted-foreground"}`}
    >
      {children}
    </button>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${active ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}
