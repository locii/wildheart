"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { MapPin, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Location, AppointmentWithRelations } from "@/lib/supabase/types";

type DateFilter = "upcoming" | "today" | "week" | "month" | "all";
type LocationFilter = "all" | string;

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All" },
];

export function AppointmentsList({ locations }: { locations: Location[] }) {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("upcoming");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const now = new Date();

    const params = new URLSearchParams();

    const location = locations.find((l) => l.slug === locationFilter);
    if (location) params.set("locationId", location.id);

    if (dateFilter === "today") {
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      const end = new Date(now); end.setHours(23, 59, 59, 999);
      params.set("from", start.toISOString());
      params.set("to", end.toISOString());
    } else if (dateFilter === "upcoming") {
      params.set("from", now.toISOString());
    } else if (dateFilter === "week") {
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 7);
      params.set("from", start.toISOString());
      params.set("to", end.toISOString());
    } else if (dateFilter === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      params.set("from", start.toISOString());
      params.set("to", end.toISOString());
    }

    const res = await fetch(`/api/appointments?${params}`);
    const { appointments } = await res.json();
    setAppointments(appointments ?? []);
    setLoading(false);
  }, [dateFilter, locationFilter, locations]);

  useEffect(() => { load(); }, [load]);

  const filtered = appointments.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.client.first_name.toLowerCase().includes(q) ||
      a.client.last_name.toLowerCase().includes(q) ||
      a.client.email.toLowerCase().includes(q)
    );
  });

  function exportCsv() {
    const headers = [
      "Start Time", "End Time", "Timezone", "First Name", "Last Name",
      "Phone", "Email", "Type", "Calendar", "Appointment Price", "Appointment ID",
    ];
    const rows = filtered.map((a) => {
      const tz = a.timezone;
      const start = toZonedTime(new Date(a.start_at), tz);
      const end = toZonedTime(new Date(a.end_at), tz);
      return [
        format(start, "MMMM d, yyyy h:mm aa"),
        format(end, "MMMM d, yyyy h:mm aa"),
        tz,
        a.client.first_name,
        a.client.last_name,
        a.client.phone ?? "",
        a.client.email,
        a.type.name,
        a.location.name,
        a.type.price.toFixed(2),
        a.id,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        {/* Location tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          <FilterChip active={locationFilter === "all"} onClick={() => setLocationFilter("all")}>
            All locations
          </FilterChip>
          {locations.map((l) => (
            <FilterChip key={l.slug} active={locationFilter === l.slug} onClick={() => setLocationFilter(l.slug)}>
              {l.name}
            </FilterChip>
          ))}
        </div>

        {/* Date tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {DATE_OPTIONS.map((opt) => (
            <FilterChip key={opt.value} active={dateFilter === opt.value} onClick={() => setDateFilter(opt.value)}>
              {opt.label}
            </FilterChip>
          ))}
        </div>

        {/* Search + export */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-muted/50 shrink-0"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No appointments found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <AppointmentCard key={a.id} appointment={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "text-gray-600 border-gray-200 hover:border-gray-400"
      }`}
    >
      {children}
    </button>
  );
}

function AppointmentCard({ appointment: a }: { appointment: AppointmentWithRelations }) {
  const start = toZonedTime(new Date(a.start_at), a.timezone);
  const isCancelled = !!a.cancelled_at;

  return (
    <Link
      href={`/admin/appointments/${a.id}`}
      className={`block bg-card border rounded-xl p-4 active:scale-[0.99] transition-transform ${
        isCancelled ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium text-sm">
            {a.client.first_name} {a.client.last_name}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{a.type.name}</div>
        </div>
        <div className="text-right shrink-0 space-y-1">
          <div className="text-xs font-medium text-gray-700 tabular-nums">
            {format(start, "EEE d MMM")}
          </div>
          <div className="text-xs text-gray-500 tabular-nums">
            {format(start, "h:mm a")}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        <span className="flex items-center gap-0.5 text-xs text-gray-400">
          <MapPin className="h-3 w-3" />{a.location.name}
        </span>
        {isCancelled && (
          <Badge variant="outline" className="text-[10px] border-red-200 text-red-500">Cancelled</Badge>
        )}
      </div>
    </Link>
  );
}
