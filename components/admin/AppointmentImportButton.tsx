"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import type { AppointmentRow } from "@/lib/import-appointments";
import type { Location, AppointmentType } from "@/lib/supabase/types";

type Mappings = {
  types: Record<string, string | null>;
  locations: Record<string, string | null>;
};

interface PreviewData {
  toImport: AppointmentRow[];
  skipped: number;
  invalid: { email: string; issues: string[] }[];
  parseErrors: string[];
  unknownTypes: string[];
  unknownLocations: string[];
}

type Step = "upload" | "mapping" | "preview" | "done";

export function AppointmentImportButton({
  locations = [],
  types = [],
}: {
  locations?: Location[];
  types?: AppointmentType[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [mappings, setMappings] = useState<Mappings>({ types: {}, locations: {} });
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setCsv(""); setPreview(null); setResult(null); setError(null);
    setMappings({ types: {}, locations: {} });
    setStep("upload");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function fetchPreview(csvText: string, m: Mappings) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/appointments/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: csvText, mappings: m }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.toImport) {
      setError(data.parseErrors?.join(", ") ?? data.error ?? "Failed to parse CSV");
      return null;
    }
    return data as PreviewData;
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsv(text);
    const data = await fetchPreview(text, { types: {}, locations: {} });
    if (!data) return;
    setPreview(data);
    if (data.unknownTypes.length > 0 || data.unknownLocations.length > 0) {
      // Pre-fill mappings with null (skip) as default
      const tm: Record<string, string | null> = {};
      const lm: Record<string, string | null> = {};
      data.unknownTypes.forEach((t) => { tm[t] = null; });
      data.unknownLocations.forEach((l) => { lm[l] = null; });
      setMappings({ types: tm, locations: lm });
      setStep("mapping");
    } else {
      setStep("preview");
    }
  }

  async function applyMappings() {
    const data = await fetchPreview(csv, mappings);
    if (!data) return;
    setPreview(data);
    setStep("preview");
  }

  async function confirm() {
    setLoading(true);
    const res = await fetch("/api/appointments/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv, confirm: true, mappings }),
    });
    const data = await res.json();
    setLoading(false);
    setResult({ imported: data.imported, skipped: data.skipped });
    router.refresh();
    setStep("done");
  }

  const allMapped = preview
    ? preview.unknownTypes.every((t) => mappings.types[t] !== undefined)
      && preview.unknownLocations.every((l) => mappings.locations[l] !== undefined)
    : false;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="h-3.5 w-3.5 mr-1" /> Import
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); } setOpen(o); }}>
        <DialogContent className="max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Squarespace appointments</DialogTitle>
          </DialogHeader>

          {step === "upload" && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Export your schedule from Squarespace (Scheduling → Appointments → Export) and upload the CSV here.
              </p>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <label className="flex flex-col items-center gap-3 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {loading ? "Reading…" : "Click to select schedule CSV"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={onFile}
                  disabled={loading}
                />
              </label>
            </div>
          )}

          {step === "mapping" && preview && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Some values in the CSV don&apos;t match your system. Map them to existing ones or skip those rows.
              </p>

              {preview.unknownTypes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Service types</p>
                  {preview.unknownTypes.map((name) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate" title={name}>
                          &ldquo;{name}&rdquo;
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                      <select
                        className="flex-1 text-xs bg-input border border-border rounded-lg px-2 py-1.5 text-foreground"
                        value={mappings.types[name] ?? ""}
                        onChange={(e) => setMappings((m) => ({
                          ...m,
                          types: { ...m.types, [name]: e.target.value || null },
                        }))}
                      >
                        <option value="">Skip these rows</option>
                        {types.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {preview.unknownLocations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Locations</p>
                  {preview.unknownLocations.map((slug) => (
                    <div key={slug} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate" title={slug}>
                          &ldquo;{slug || "(empty)"}&rdquo;
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                      <select
                        className="flex-1 text-xs bg-input border border-border rounded-lg px-2 py-1.5 text-foreground"
                        value={mappings.locations[slug] ?? ""}
                        onChange={(e) => setMappings((m) => ({
                          ...m,
                          locations: { ...m.locations, [slug]: e.target.value || null },
                        }))}
                      >
                        <option value="">Skip these rows</option>
                        {locations.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={reset}>Back</Button>
                <Button size="sm" className="flex-1" onClick={applyMappings} disabled={loading || !allMapped}>
                  {loading ? "Checking…" : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {step === "preview" && preview && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{preview.toImport.length}</strong> appointments will be imported ·{" "}
                <strong className="text-foreground">{preview.skipped}</strong> already exist or skipped.
              </p>

              {preview.invalid.length > 0 && (
                <div className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 rounded-lg p-3 space-y-1">
                  <p className="font-medium">Cannot import {preview.invalid.length} rows:</p>
                  {preview.invalid.slice(0, 5).map((r, i) => (
                    <p key={i}>{r.email}: {r.issues.join(", ")}</p>
                  ))}
                  {preview.invalid.length > 5 && <p>…and {preview.invalid.length - 5} more</p>}
                </div>
              )}

              {preview.toImport.length > 0 && (
                <div className="border rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground grid grid-cols-3 gap-2">
                    <span>Client</span><span>Date</span><span>Type</span>
                  </div>
                  <div className="divide-y max-h-52 overflow-y-auto">
                    {preview.toImport.map((r, i) => (
                      <div key={i} className="px-3 py-2 text-xs grid grid-cols-3 gap-2">
                        <span className="truncate">{r.firstName} {r.lastName}</span>
                        <span className="text-muted-foreground">
                          {format(new Date(r.startAt), "d MMM yy")}
                          {r.cancelledAt && " ✕"}
                        </span>
                        <span className="truncate text-muted-foreground">{r.typeName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep(preview.unknownTypes.length || preview.unknownLocations.length ? "mapping" : "upload")}>
                  Back
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={confirm}
                  disabled={loading || preview.toImport.length === 0}
                >
                  {loading ? "Importing…" : `Import ${preview.toImport.length}`}
                </Button>
              </div>
            </div>
          )}

          {step === "done" && result && (
            <div className="py-6 text-center space-y-2">
              <p className="text-3xl font-bold">{result.imported}</p>
              <p className="text-sm text-muted-foreground">
                appointments imported · {result.skipped} already existed or skipped
              </p>
              <Button className="mt-4" onClick={() => { reset(); setOpen(false); }}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
