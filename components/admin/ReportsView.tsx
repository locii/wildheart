"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  addWeeks, addMonths, addYears,
  subWeeks, subMonths, subYears,
  format, startOfMonth, startOfYear, startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

function financialYear(d: Date): number {
  return d.getMonth() >= 6 ? d.getFullYear() + 1 : d.getFullYear();
}
import { Button } from "@/components/ui/button";
import type { ReportData, ReportPeriod } from "@/lib/reports";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "fy", label: "Fin. Year" },
];

export function ReportsView() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [allTimeSessions, setAllTimeSessions] = useState<number | null>(null);
  const [allTimeClients, setAllTimeClients] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerBtnRef = useRef<HTMLButtonElement>(null);

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
    setPickerYear(anchor.getFullYear());
    setPickerOpen((o) => !o);
  }

  const load = useCallback(async (p: ReportPeriod, a: Date) => {
    setLoading(true);
    const res = await fetch(
      `/api/reports?period=${p}&anchor=${a.toISOString()}`
    );
    const json = await res.json();
    setData(json.data);
    setFrom(json.from);
    setTo(json.to);
    if (json.allTimeSessions !== undefined) setAllTimeSessions(json.allTimeSessions);
    if (json.allTimeClients !== undefined) setAllTimeClients(json.allTimeClients);
    setLoading(false);
  }, []);

  useEffect(() => { load(period, anchor); }, [period, anchor, load]);

  function navigate(dir: 1 | -1) {
    setAnchor((prev) => {
      if (period === "week") return dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1);
      if (period === "year" || period === "fy") return dir === 1 ? addYears(prev, 1) : subYears(prev, 1);
      return dir === 1 ? addMonths(prev, 1) : subMonths(prev, 1);
    });
  }

  function periodLabel() {
    if (period === "week") return `${format(new Date(from), "d MMM")} – ${format(new Date(to), "d MMM yyyy")}`;
    if (period === "year") return format(startOfYear(anchor), "yyyy");
    if (period === "fy") return `FY${financialYear(anchor)}`;
    return format(startOfMonth(anchor), "MMMM yyyy");
  }

  function downloadCSV() {
    if (!data) return;
    const rows = [
      ["Period", "Revenue", "Appointments", "Avg Value"],
      ...data.buckets.map((b) => [b.label, b.revenue, b.count, b.avgValue.toFixed(2)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${period}-${format(anchor, "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold">Reports</h1>
        <Button variant="outline" size="sm" onClick={downloadCSV} disabled={!data}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
      </div>
      {allTimeSessions !== null && (
        <p className="text-sm text-muted-foreground mb-5">
          {allTimeSessions.toLocaleString()} sessions · {allTimeClients?.toLocaleString()} clients all time
        </p>
      )}

      {/* Period selector */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex rounded-lg border overflow-hidden text-sm">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => { setPeriod(p.value); setAnchor(new Date()); }}
              className={`px-4 py-2 transition-colors ${period === p.value ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted/50"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="relative">
            <button
              ref={pickerBtnRef}
              onClick={openPicker}
              className="text-sm font-medium px-1 min-w-[140px] text-center hover:text-primary transition-colors"
            >
              {periodLabel()}
            </button>
            {pickerOpen && (
              <div
                ref={pickerRef}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 bg-card border rounded-xl shadow-lg p-3 w-52"
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
                    const isActive = pickerYear === anchor.getFullYear() && idx === anchor.getMonth();
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setAnchor(new Date(pickerYear, idx, 1));
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
          <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <SummaryCard label="Revenue" value={`$${data.totalRevenue.toLocaleString()}`} />
            <SummaryCard label="Sessions" value={String(data.totalCount)} />
            <SummaryCard label="Clients" value={String(data.totalClients)} />
            <SummaryCard label="Avg value" value={`$${data.avgValue.toFixed(0)}`} />
            <SummaryCard label="Per client" value={data.totalClients > 0 ? (data.totalCount / data.totalClients).toFixed(1) : "—"} />
          </div>

          {/* Chart */}
          {data.buckets.length > 0 && (
            <div className="bg-card border rounded-2xl p-4 mb-6">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Revenue by period</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.buckets} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [`$${v}`, "Revenue"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-chart-1)"
                    radius={[4, 4, 0, 0]}
                    activeBar={{ fill: "var(--color-chart-2)" }}
                    isAnimationActive
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <BreakdownCard title="By type" rows={data.byType} />
            <BreakdownCard title="By location" rows={data.byLocation} />
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center py-12">No data available</p>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border rounded-2xl px-4 py-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; revenue: number; count: number }[];
}) {
  return (
    <div className="bg-card border rounded-2xl p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">{title}</p>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400">No data</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.name} className="flex justify-between items-center text-sm">
              <span className="text-gray-700 truncate">{r.name}</span>
              <div className="text-right ml-4 shrink-0">
                <span className="font-medium">${r.revenue.toLocaleString()}</span>
                <span className="text-gray-400 text-xs ml-2">({r.count})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
