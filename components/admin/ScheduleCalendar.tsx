"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  EventClickArg, EventDropArg, DateSelectArg, EventInput,
  EventContentArg,
} from "@fullcalendar/core";
import { format, parseISO } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { Search, X, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Location, AppointmentType, Client, AppointmentWithRelations, AvailabilityOverride } from "@/lib/supabase/types";

const TIMEZONE = "Australia/Melbourne";
const LOC_COLORS: Record<string, string> = {
  brunswick: "#3b82f6",
  lorne: "#7c3aed",
};

interface Selection { start: Date; end: Date }
interface BlockEdit {
  id: string;
  locationId: string;
  date: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  notes: string;
  repeatWeekly: boolean;
}

export function ScheduleCalendar({
  locations,
  types,
}: {
  locations: Location[];
  types: AppointmentType[];
}) {
  const router = useRouter();
  const calRef = useRef<FullCalendar>(null);
  const [locationFilter, setLocationFilter] = useState<"all" | string>("all");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [editingBlock, setEditingBlock] = useState<BlockEdit | null>(null);

  // Events fetcher — used as FullCalendar events function so refetchEvents() works
  const fetchCalendarEvents = useCallback(async (
    info: { startStr: string; endStr: string },
    successCallback: (events: EventInput[]) => void,
    failureCallback: (error: Error) => void,
  ) => {
    try {
      const [apptRes, blockRes] = await Promise.all([
        fetch(`/api/appointments?from=${encodeURIComponent(info.startStr)}&to=${encodeURIComponent(info.endStr)}`),
        fetch(`/api/availability/overrides?locationId=all`),
      ]);

      const { appointments } = await apptRes.json() as { appointments: AppointmentWithRelations[] };
      const { overrides } = await blockRes.json() as { overrides: AvailabilityOverride[] };

      const apptEvents: EventInput[] = (appointments ?? [])
        .filter((a) => locationFilter === "all" || a.location.slug === locationFilter)
        .map((a) => ({
          id: `appt-${a.id}`,
          title: `${a.client.first_name} ${a.client.last_name}`,
          start: a.start_at,
          end: a.end_at,
          color: LOC_COLORS[a.location.slug] ?? "#6b7280",
          extendedProps: {
            kind: "appointment",
            locationSlug: a.location.slug,
            typeName: a.type.name,
            paid: a.paid,
            price: a.type.price,
          },
        }));

      const rangeStart = new Date(info.startStr);
      const rangeEnd = new Date(info.endStr);

      const blockEvents: EventInput[] = (overrides ?? [])
        .filter((o) => {
          const loc = locations.find((l) => l.id === o.location_id);
          return locationFilter === "all" || loc?.slug === locationFilter;
        })
        .flatMap((o) => {
          const loc = locations.find((l) => l.id === o.location_id);
          const startTime = o.start_time ?? "00:00:00";
          const endTime = o.end_time ?? "23:59:00";
          const eventStart = fromZonedTime(new Date(`${o.date}T${startTime}`), TIMEZONE);
          const eventEnd = fromZonedTime(new Date(`${o.date}T${endTime}`), TIMEZONE);
          if (eventEnd < rangeStart || eventStart > rangeEnd) return [];
          return [{
            id: `block-${o.id}`,
            title: o.notes ? `Blocked · ${o.notes}` : "Blocked",
            start: eventStart.toISOString(),
            end: eventEnd.toISOString(),
            color: "#e5e7eb",
            textColor: "#6b7280",
            borderColor: "#d1d5db",
            extendedProps: {
              kind: "block",
              overrideId: o.id,
              locationId: o.location_id,
              locationSlug: loc?.slug ?? "",
              date: o.date,
              startTime: o.start_time,
              endTime: o.end_time,
              notes: o.notes ?? "",
              allDay: !o.start_time,
              repeatWeekly: o.repeat_weekly,
            },
          }];
        });

      successCallback([...apptEvents, ...blockEvents]);
    } catch (e) {
      failureCallback(e as Error);
    }
  }, [locationFilter, locations]);

  // Refetch when filter changes
  useEffect(() => {
    calRef.current?.getApi().refetchEvents();
  }, [locationFilter]);

  function refetch() {
    calRef.current?.getApi().refetchEvents();
  }

  function handleEventClick(info: EventClickArg) {
    const props = info.event.extendedProps;
    if (props.kind === "appointment") {
      router.push(`/admin/appointments/${info.event.id.replace("appt-", "")}`);
    } else if (props.kind === "block") {
      setEditingBlock({
        id: props.overrideId as string,
        locationId: props.locationId as string,
        date: props.date as string,
        allDay: props.allDay as boolean,
        startTime: (props.startTime as string | null) ?? "09:00",
        endTime: (props.endTime as string | null) ?? "17:00",
        notes: props.notes as string,
        repeatWeekly: props.repeatWeekly as boolean,
      });
    }
  }

  async function handleEventDrop(info: EventDropArg) {
    const { kind, overrideId } = info.event.extendedProps;
    if (kind === "appointment") {
      const rawId = info.event.id.replace("appt-", "");
      const res = await fetch(`/api/appointments/${rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_at: info.event.startStr, end_at: info.event.endStr }),
      });
      if (!res.ok) { info.revert(); alert("Could not reschedule — the slot may be taken."); }
    } else if (kind === "block" && info.event.start) {
      const newDate = format(info.event.start, "yyyy-MM-dd");
      const newStart = format(info.event.start, "HH:mm:ss");
      const newEnd = info.event.end ? format(info.event.end, "HH:mm:ss") : null;
      const res = await fetch(`/api/availability/overrides/${overrideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, start_time: newStart, end_time: newEnd }),
      });
      if (!res.ok) info.revert();
    }
  }

  function handleSelect(info: DateSelectArg) {
    setSelection({ start: info.start, end: info.end });
    calRef.current?.getApi().unselect();
  }

  return (
    <div className="space-y-3">
      {/* Location filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        <FilterChip active={locationFilter === "all"} onClick={() => setLocationFilter("all")}>
          All locations
        </FilterChip>
        {locations.map((l) => (
          <FilterChip key={l.slug} active={locationFilter === l.slug} onClick={() => setLocationFilter(l.slug)}>
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: LOC_COLORS[l.slug] }} />
            {l.name}
          </FilterChip>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <FullCalendar
          ref={calRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          timeZone={TIMEZONE}
          headerToolbar={{ left: "prev,next today", center: "title", right: "timeGridWeek,timeGridDay" }}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          slotDuration="00:15:00"
          snapDuration="00:15:00"
          allDaySlot={false}
          nowIndicator
          editable
          selectable
          selectMirror
          events={fetchCalendarEvents}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          select={handleSelect}
          eventContent={(info) => <EventContent info={info} />}
          eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
          buttonText={{ today: "Today", week: "Week", day: "Day" }}
          dayHeaderFormat={{ weekday: "short", day: "numeric", month: "short" }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        {locations.map((l) => (
          <span key={l.slug} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: LOC_COLORS[l.slug] }} />
            {l.name}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-border border border-gray-300" />
          Blocked
        </span>
      </div>

      {/* Create dialog */}
      {selection && (
        <CreateDialog
          selection={selection}
          locations={locations}
          types={types}
          onClose={() => setSelection(null)}
          onCreated={() => { setSelection(null); refetch(); }}
        />
      )}

      {/* Edit block dialog */}
      {editingBlock && (
        <EditBlockDialog
          block={editingBlock}
          locations={locations}
          onClose={() => setEditingBlock(null)}
          onSaved={() => { setEditingBlock(null); refetch(); }}
        />
      )}
    </div>
  );
}

// ─── Custom event content ─────────────────────────────────────────────────────

function EventContent({ info }: { info: EventContentArg }) {
  const { kind, typeName, paid, price } = info.event.extendedProps;
  if (kind === "block") {
    return (
      <div className="px-1.5 py-0.5 w-full truncate text-[11px] text-gray-500">
        {info.event.title}
      </div>
    );
  }
  return (
    <div className="px-1.5 py-0.5 w-full min-w-0">
      <div className="text-[11px] font-semibold truncate text-white leading-tight">{info.event.title}</div>
      {typeName && <div className="text-[10px] text-white/80 truncate">{typeName}</div>}
      {(price as number) > 0 && (
        <div className="text-[10px] text-white/70">{paid ? "✓ paid" : `$${price}`}</div>
      )}
    </div>
  );
}

// ─── Create dialog (book or block) ───────────────────────────────────────────

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
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-gray-500">{timeLabel}</DialogTitle>
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

  const loc = locations.find((l) => l.id === block.locationId);

  async function save() {
    setSaving(true);
    await fetch(`/api/availability/overrides/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_time: allDay ? null : startTime + ":00",
        end_time: allDay ? null : endTime + ":00",
        notes: notes || null,
        repeat_weekly: repeatWeekly,
      }),
    });
    onSaved();
  }

  async function deleteBlock() {
    setDeleting(true);
    await fetch(`/api/availability/overrides/${block.id}`, { method: "DELETE" });
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>Edit block</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Location + date (read-only) */}
          <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-sm space-y-0.5">
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              {loc?.name ?? "Unknown location"} · {format(parseISO(block.date), "EEE d MMM yyyy")}
              {repeatWeekly && <span className="text-[10px] bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 ml-auto">Weekly</span>}
            </div>
          </div>

          {/* All day toggle */}
          <button onClick={() => setAllDay((v) => !v)} className="flex items-center gap-3 w-full">
            <span className={`w-10 h-6 rounded-full flex items-center transition-colors shrink-0 ${allDay ? "bg-gray-900" : "bg-border"}`}>
              <span className={`w-4 h-4 bg-card rounded-full shadow mx-1 transition-transform ${allDay ? "translate-x-4" : ""}`} />
            </span>
            <span className="text-sm">All day</span>
          </button>

          {/* Time range */}
          {!allDay && (
            <div className="flex items-center gap-2">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 text-sm border rounded-lg px-3 py-2" />
              <span className="text-gray-400">–</span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 text-sm border rounded-lg px-3 py-2" />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Conference, Annual leave…"
              rows={2}
            />
          </div>

          {/* Repeat weekly */}
          <button onClick={() => setRepeatWeekly((v) => !v)} className="flex items-center gap-3 w-full">
            <span className={`w-10 h-6 rounded-full flex items-center transition-colors shrink-0 ${repeatWeekly ? "bg-gray-900" : "bg-border"}`}>
              <span className={`w-4 h-4 bg-card rounded-full shadow mx-1 transition-transform ${repeatWeekly ? "translate-x-4" : ""}`} />
            </span>
            <div className="text-left">
              <div className="text-sm">Repeat weekly</div>
              <div className="text-xs text-gray-400">Blocks every {format(parseISO(block.date), "EEEE")}</div>
            </div>
          </button>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button onClick={save} disabled={saving} className="flex-1" size="sm">
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteBlock}
              disabled={deleting}
              className="text-red-500 hover:text-red-700 hover:border-red-300"
            >
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
      }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Failed"); setSaving(false); return; }
    onCreated();
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Location */}
      <div className="space-y-1.5">
        <Label className="text-xs">Location</Label>
        <div className="flex gap-1.5">
          {locations.map((l) => (
            <button key={l.slug} onClick={() => setLocationSlug(l.slug)}
              className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${locationSlug === l.slug ? "bg-primary text-primary-foreground border-primary" : "text-gray-500"}`}>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <Label className="text-xs">Service</Label>
        <div className="space-y-1">
          {types.map((t) => (
            <button key={t.id} onClick={() => setTypeId(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${typeId === t.id ? "bg-primary text-primary-foreground border-primary" : "text-gray-700 hover:border-gray-400"}`}>
              {t.name} · {t.duration_minutes} min
            </button>
          ))}
        </div>
      </div>

      {/* Client */}
      <div className="space-y-1.5">
        <Label className="text-xs">Client</Label>
        {selectedClient ? (
          <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-xs">
            <span className="font-medium">{selectedClient.first_name} {selectedClient.last_name}</span>
            <button onClick={() => setSelectedClient(null)}><X className="h-3.5 w-3.5 text-gray-400" /></button>
          </div>
        ) : isNew ? (
          <div className="space-y-2">
            <button onClick={() => setIsNew(false)} className="flex items-center gap-1 text-xs text-gray-400">
              <X className="h-3 w-3" /> Cancel
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="First name" value={newClient.first_name} onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })} className="h-8 text-xs" />
              <Input placeholder="Last name" value={newClient.last_name} onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })} className="h-8 text-xs" />
            </div>
            <Input placeholder="Email" type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="h-8 text-xs" />
            <Input placeholder="Phone (optional)" type="tel" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="h-8 text-xs" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input placeholder="Search client…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-8 text-xs" autoFocus />
            </div>
            {results.map((c) => (
              <button key={c.id} onClick={() => { setSelectedClient(c); setQ(""); setResults([]); }}
                className="w-full text-left px-3 py-2 text-xs border rounded-lg hover:bg-muted/50">
                <span className="font-medium">{c.first_name} {c.last_name}</span>
                <span className="text-gray-400 ml-2">{c.email}</span>
              </button>
            ))}
            {q.trim() && results.length === 0 && (
              <button onClick={() => setIsNew(true)}
                className="w-full text-xs text-blue-600 border border-dashed rounded-lg py-2 hover:border-blue-400">
                + Create new client
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button onClick={book} disabled={!hasClient || saving} className="flex-1" size="sm">
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
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const date = format(selection.start, "yyyy-MM-dd");
  const startTime = format(selection.start, "HH:mm:ss");
  const endTime = format(selection.end, "HH:mm:ss");
  const isAllDay = startTime === "00:00:00" && endTime === "00:00:00";

  async function block() {
    setSaving(true);
    await fetch("/api/availability/overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId, date,
        allDay: isAllDay,
        startTime: isAllDay ? null : startTime,
        endTime: isAllDay ? null : endTime,
        repeatWeekly: false,
        notes: notes || null,
      }),
    });
    onCreated();
  }

  return (
    <div className="space-y-4 pt-1">
      <div className="space-y-1.5">
        <Label className="text-xs">Location</Label>
        <div className="flex gap-1.5">
          {locations.map((l) => (
            <button key={l.id} onClick={() => setLocationId(l.id)}
              className={`flex-1 py-2.5 text-xs rounded-lg border font-medium transition-colors flex items-center justify-center gap-1.5 ${locationId === l.id ? "bg-primary text-primary-foreground border-primary" : "text-gray-500"}`}>
              <MapPin className="h-3 w-3" />{l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-500 space-y-0.5">
        <div>{format(selection.start, "EEE d MMM yyyy")}</div>
        <div>{isAllDay ? "All day" : `${format(selection.start, "h:mm a")} – ${format(selection.end, "h:mm a")}`}</div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Conference, Annual leave…"
          rows={2}
        />
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
    <button onClick={onClick}
      className={`shrink-0 flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "text-gray-600 border-gray-200 hover:border-gray-400"}`}>
      {children}
    </button>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${active ? "bg-muted/50 shadow-sm" : "text-gray-500"}`}>
      {children}
    </button>
  );
}
