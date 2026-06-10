"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Search, Upload, User, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Client } from "@/lib/supabase/types";
import type { ImportRow } from "@/lib/import";

interface Props {
  initialClients: Client[];
}

export function ClientsView({ initialClients }: Props) {
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  async function search(q: string) {
    setSearching(true);
    const res = await fetch(`/api/clients?q=${encodeURIComponent(q)}`);
    const { clients: data } = await res.json();
    setClients(data ?? []);
    setSearching(false);
  }

  function onQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => search(q), 300);
  }

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Clients</h1>
          <p className="text-sm text-gray-400">{clients.length} shown</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="h-3.5 w-3.5 mr-1" /> Import
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or email…"
          value={query}
          onChange={onQueryChange}
          className="pl-9"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); search(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Client list */}
      {clients.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <User className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">{query ? "No clients found" : "No clients yet"}</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl divide-y overflow-hidden">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {client.first_name} {client.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{client.email}</p>
                {client.last_appointment_at && (
                  <p className="text-xs text-gray-400">
                    Last seen {formatDistanceToNow(new Date(client.last_appointment_at), { addSuffix: true })}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 ml-2" />
            </Link>
          ))}
        </div>
      )}

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => { setImportOpen(false); search(query); }}
      />
    </div>
  );
}

// ─── Import dialog ────────────────────────────────────────────────────────────

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

interface PreviewData {
  toImport: ImportRow[];
  skipped: ImportRow[];
  parseErrors: string[];
}

function ImportDialog({ open, onClose, onImported }: ImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setPreview(null);
    setCsv("");
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsv(text);
    setLoading(true);
    setError(null);
    const res = await fetch("/api/clients/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: text }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.errors?.length && !data.toImport) {
      setError(data.errors.join(", "));
    } else {
      setPreview(data);
    }
  }

  async function confirm() {
    setLoading(true);
    const res = await fetch("/api/clients/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv, confirm: true }),
    });
    const data = await res.json();
    setLoading(false);
    setResult({ imported: data.imported, skipped: data.skipped });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import from Squarespace</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="py-4 text-center space-y-2">
            <p className="text-2xl font-bold">{result.imported}</p>
            <p className="text-sm text-gray-500">clients imported ({result.skipped} skipped — already exist)</p>
            <Button onClick={() => { reset(); onImported(); }} className="mt-4">Done</Button>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <strong>{preview.toImport.length}</strong> clients will be imported,{" "}
              <strong>{preview.skipped.length}</strong> skipped (already in system).
            </div>

            {preview.parseErrors.length > 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                {preview.parseErrors.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            )}

            {preview.toImport.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-muted/50 text-xs font-medium text-gray-500 grid grid-cols-3 gap-2">
                  <span>Name</span><span>Email</span><span>Last appt</span>
                </div>
                <div className="divide-y max-h-48 overflow-y-auto">
                  {preview.toImport.map((r, i) => (
                    <div key={i} className="px-3 py-2 text-xs grid grid-cols-3 gap-2">
                      <span className="truncate">{r.first_name} {r.last_name}</span>
                      <span className="truncate text-gray-500">{r.email}</span>
                      <span className="text-gray-400">
                        {r.last_appointment_at
                          ? format(new Date(r.last_appointment_at), "d MMM yy")
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={reset}>Back</Button>
              <Button
                className="flex-1"
                onClick={confirm}
                disabled={loading || preview.toImport.length === 0}
              >
                {loading ? "Importing…" : `Import ${preview.toImport.length} clients`}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">
              Upload a CSV exported from Squarespace. Expected columns:{" "}
              <code className="text-xs bg-muted px-1 rounded">First Name, Last Name, Phone, Email, Days Since Last Appointment</code>
            </p>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-gray-300 transition-colors">
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-500">
                {loading ? "Reading file…" : "Click to select CSV file"}
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
      </DialogContent>
    </Dialog>
  );
}
