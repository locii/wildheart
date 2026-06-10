"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Trash2, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { Location, AvailabilityRule, AvailabilityOverride } from "@/lib/supabase/types";

const DAYS = [
  { dow: 1, label: "Monday", short: "Mon" },
  { dow: 2, label: "Tuesday", short: "Tue" },
  { dow: 3, label: "Wednesday", short: "Wed" },
  { dow: 4, label: "Thursday", short: "Thu" },
  { dow: 5, label: "Friday", short: "Fri" },
  { dow: 6, label: "Saturday", short: "Sat" },
  { dow: 0, label: "Sunday", short: "Sun" },
];

type DayRule = {
  day_of_week: number;
  is_active: boolean;
  start_time: string;
  end_time: string;
};

function defaultWeek(): DayRule[] {
  return DAYS.map((d) => ({
    day_of_week: d.dow,
    is_active: false,
    start_time: "09:00",
    end_time: "17:00",
  }));
}

function mergeRules(rules: AvailabilityRule[]): DayRule[] {
  return DAYS.map((d) => {
    const existing = rules.find((r) => r.day_of_week === d.dow);
    return existing
      ? {
          day_of_week: d.dow,
          is_active: existing.is_active,
          start_time: existing.start_time.substring(0, 5),
          end_time: existing.end_time.substring(0, 5),
        }
      : { day_of_week: d.dow, is_active: false, start_time: "09:00", end_time: "17:00" };
  });
}

export function AvailabilityEditor({ locations }: { locations: Pick<Location, "id" | "name" | "slug">[] }) {
  const [activeTab, setActiveTab] = useState(locations[0]?.slug ?? "");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full mb-5">
        {locations.map((loc) => (
          <TabsTrigger key={loc.slug} value={loc.slug} className="flex-1">
            {loc.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {locations.map((loc) => (
        <TabsContent key={loc.slug} value={loc.slug}>
          <LocationAvailability location={loc} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function LocationAvailability({ location }: { location: Pick<Location, "id" | "name" | "slug"> }) {
  const [week, setWeek] = useState<DayRule[]>(defaultWeek());
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Override form state
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [blockStart, setBlockStart] = useState("09:00");
  const [blockEnd, setBlockEnd] = useState("17:00");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [addingBlock, setAddingBlock] = useState(false);

  const loadData = useCallback(async () => {
    const [rulesRes, overridesRes] = await Promise.all([
      fetch(`/api/availability/rules?locationId=${location.id}`),
      fetch(`/api/availability/overrides?locationId=${location.id}`),
    ]);
    const { rules } = await rulesRes.json();
    const { overrides } = await overridesRes.json();
    if (rules) setWeek(mergeRules(rules));
    if (overrides) setOverrides(overrides);
  }, [location.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function toggleDay(dow: number) {
    setWeek((prev) =>
      prev.map((d) => (d.day_of_week === dow ? { ...d, is_active: !d.is_active } : d))
    );
    setSaved(false);
  }

  function updateTime(dow: number, field: "start_time" | "end_time", value: string) {
    setWeek((prev) =>
      prev.map((d) => (d.day_of_week === dow ? { ...d, [field]: value } : d))
    );
    setSaved(false);
  }

  async function saveSchedule() {
    setSaving(true);
    await fetch("/api/availability/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId: location.id, rules: week }),
    });
    setSaving(false);
    setSaved(true);
  }

  async function addBlock() {
    if (!blockDate) return;
    setAddingBlock(true);
    const res = await fetch("/api/availability/overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId: location.id,
        date: blockDate,
        allDay,
        startTime: allDay ? null : blockStart,
        endTime: allDay ? null : blockEnd,
        repeatWeekly,
      }),
    });
    const { override } = await res.json();
    if (override) setOverrides((prev) => [...prev, override].sort((a, b) => a.date.localeCompare(b.date)));
    setBlockDate("");
    setAllDay(true);
    setRepeatWeekly(false);
    setShowAddBlock(false);
    setAddingBlock(false);
  }

  async function deleteBlock(id: string) {
    await fetch(`/api/availability/overrides/${id}`, { method: "DELETE" });
    setOverrides((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="space-y-8">
      {/* Weekly Schedule */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Weekly Schedule
        </h2>
        <div className="bg-card border rounded-xl overflow-hidden divide-y">
          {DAYS.map((day) => {
            const rule = week.find((d) => d.day_of_week === day.dow)!;
            return (
              <div key={day.dow} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => toggleDay(day.dow)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <span
                      className={`w-10 h-6 rounded-full flex items-center transition-colors shrink-0 ${
                        rule.is_active ? "bg-white" : "bg-border"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 bg-card rounded-full shadow mx-1 transition-transform ${
                          rule.is_active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </span>
                    <span
                      className={`text-sm font-medium w-24 ${
                        rule.is_active ? "text-orange" : "text-gray-400"
                      }`}
                    >
                      {day.label}
                    </span>
                  </button>
                  {rule.is_active && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={rule.start_time}
                        onChange={(e) => updateTime(day.dow, "start_time", e.target.value)}
                        className="text-sm border rounded-lg px-2 py-1.5 w-[7.5rem]"
                      />
                      <span className="text-gray-400 text-sm">–</span>
                      <input
                        type="time"
                        value={rule.end_time}
                        onChange={(e) => updateTime(day.dow, "end_time", e.target.value)}
                        className="text-sm border rounded-lg px-2 py-1.5 w-[7.5rem]"
                      />
                    </div>
                  )}
                  {!rule.is_active && (
                    <span className="text-sm text-gray-400">Unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={saveSchedule} disabled={saving} size="sm">
            {saving ? "Saving…" : "Save schedule"}
          </Button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </section>

      <Separator />

      {/* Blocked Dates */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Blocked Dates
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddBlock((v) => !v)}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add block
          </Button>
        </div>

        {showAddBlock && (
          <div className="bg-card border rounded-xl p-4 mb-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
              />
            </div>

            {/* All day / time range toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setAllDay(true)}
                className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
                  allDay ? "bg-primary text-primary-foreground border-primary" : "text-gray-500"
                }`}
              >
                All day
              </button>
              <button
                onClick={() => setAllDay(false)}
                className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
                  !allDay ? "bg-primary text-primary-foreground border-primary" : "text-gray-500"
                }`}
              >
                Time range
              </button>
            </div>

            {!allDay && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="flex-1 text-sm border rounded-lg px-3 py-2"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="time"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="flex-1 text-sm border rounded-lg px-3 py-2"
                />
              </div>
            )}

            {/* Repeat weekly */}
            <button
              onClick={() => setRepeatWeekly((v) => !v)}
              className="flex items-center gap-3 w-full"
            >
              <span
                className={`w-10 h-6 rounded-full flex items-center transition-colors shrink-0 ${
                  repeatWeekly ? "bg-gray-900" : "bg-border"
                }`}
              >
                <span
                  className={`w-4 h-4 bg-card rounded-full shadow mx-1 transition-transform ${
                    repeatWeekly ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </span>
              <div className="text-left">
                <div className="text-sm font-medium">Repeat weekly</div>
                <div className="text-xs text-gray-400">Blocks this day every week</div>
              </div>
            </button>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={addBlock}
                disabled={!blockDate || addingBlock}
                className="flex-1"
                size="sm"
              >
                {addingBlock ? "Adding…" : "Add block"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddBlock(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {overrides.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No blocked dates</p>
        ) : (
          <div className="bg-card border rounded-xl divide-y overflow-hidden">
            {overrides.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {format(parseISO(o.date), "EEE d MMM yyyy")}
                    {o.repeat_weekly && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                        <RotateCcw className="h-2.5 w-2.5" />
                        Weekly
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {!o.start_time
                      ? "All day"
                      : `${o.start_time.substring(0, 5)} – ${o.end_time?.substring(0, 5)}`}
                  </div>
                </div>
                <button
                  onClick={() => deleteBlock(o.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
