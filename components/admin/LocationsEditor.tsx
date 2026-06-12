"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { locationColor, COLOR_SWATCHES } from "@/lib/location-colors";
import type { Location } from "@/lib/supabase/types";

type Draft = { name: string; timezone: string; color: string | null; address: string };
type NewDraft = { name: string; slug: string; timezone: string; color: string | null; address: string };

const emptyNew = (): NewDraft => ({ name: "", slug: "", timezone: "Australia/Melbourne", color: null, address: "" });

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function ColorPicker({ value, onChange }: { value: string | null; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {COLOR_SWATCHES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
          style={{
            backgroundColor: c,
            boxShadow: value === c ? `0 0 0 2px var(--color-card), 0 0 0 4px ${c}` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function LocationsEditor() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>({ name: "", timezone: "", color: null, address: "" });
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<NewDraft>(emptyNew());
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/locations");
    const { locations: data } = await res.json();
    setLocations(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(l: Location) {
    setEditingId(l.id);
    setEditDraft({ name: l.name, timezone: l.timezone, color: l.color ?? null, address: l.address ?? "" });
    setAdding(false);
    setDeleteError(null);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch(`/api/locations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editDraft.name.trim(), timezone: editDraft.timezone.trim(), color: editDraft.color, address: editDraft.address.trim() || null }),
    });
    setEditingId(null);
    await load();
    setSaving(false);
  }

  async function deleteLocation(id: string) {
    setDeleteError(null);
    if (!confirm("Delete this location? This will fail if any appointments reference it.")) return;
    const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDeleteError(body.error ?? "Cannot delete — appointments may reference this location.");
      return;
    }
    await load();
  }

  async function addLocation() {
    setSaving(true);
    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDraft),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDeleteError(body.error ?? "Failed to create location.");
      setSaving(false);
      return;
    }
    setAdding(false);
    setNewDraft(emptyNew());
    setDeleteError(null);
    await load();
    setSaving(false);
  }

  if (loading) return <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>;

  return (
    <div className="space-y-3">
      {deleteError && (
        <div className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
          {deleteError}
        </div>
      )}

      <div className="space-y-2">
        {locations.map((l, i) => {
          const color = locationColor(locations, l.slug);
          return (
            <div key={l.id} className="bg-card border rounded-xl px-4 py-3">
              {editingId === l.id ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name</Label>
                    <Input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} autoFocus />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Timezone</Label>
                    <Input value={editDraft.timezone} onChange={(e) => setEditDraft({ ...editDraft, timezone: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Address</Label>
                    <Textarea
                      rows={2}
                      value={editDraft.address}
                      onChange={(e) => setEditDraft({ ...editDraft, address: e.target.value })}
                      placeholder="123 Example St, Suburb VIC 3000"
                      className="text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Colour</Label>
                    <ColorPicker value={editDraft.color} onChange={(c) => setEditDraft({ ...editDraft, color: c })} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Slug: <code className="bg-muted px-1 rounded">{l.slug}</code>
                    <span className="ml-1 opacity-60">(used in booking URLs — cannot be changed)</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => saveEdit(l.id)} disabled={saving || !editDraft.name.trim()}>
                      <Check className="h-3.5 w-3.5 mr-1.5" />Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5 mr-1.5" />Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{l.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <code className="bg-muted px-1 rounded">{l.slug}</code>
                      <span className="ml-2 opacity-60">{l.timezone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 w-8 p-0 ${l.is_active ? "text-green-500 hover:text-green-400" : "text-muted-foreground hover:text-foreground"}`}
                      title={l.is_active ? "Visible — click to hide" : "Hidden — click to show"}
                      onClick={async () => {
                        await fetch(`/api/locations/${l.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ is_active: !l.is_active }),
                        });
                        await load();
                      }}
                    >
                      {l.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => startEdit(l)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-400" onClick={() => deleteLocation(l.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="bg-card border rounded-xl px-4 py-4 space-y-3">
          <p className="text-sm font-medium">New location</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input
              placeholder="e.g. Fitzroy"
              value={newDraft.name}
              onChange={(e) => {
                const name = e.target.value;
                setNewDraft((d) => ({ ...d, name, slug: slugify(name) }));
              }}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Slug <span className="text-muted-foreground font-normal">(used in booking URL — set once)</span></Label>
            <Input
              placeholder="fitzroy"
              value={newDraft.slug}
              onChange={(e) => setNewDraft((d) => ({ ...d, slug: slugify(e.target.value) }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Timezone</Label>
            <Input
              value={newDraft.timezone}
              onChange={(e) => setNewDraft((d) => ({ ...d, timezone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Address</Label>
            <Textarea
              rows={2}
              value={newDraft.address}
              onChange={(e) => setNewDraft((d) => ({ ...d, address: e.target.value }))}
              placeholder="123 Example St, Suburb VIC 3000"
              className="text-sm resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Colour</Label>
            <ColorPicker value={newDraft.color} onChange={(c) => setNewDraft((d) => ({ ...d, color: c }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={addLocation}
              disabled={saving || !newDraft.name.trim() || !newDraft.slug.trim()}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />Add location
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewDraft(emptyNew()); setDeleteError(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => { setAdding(true); setEditingId(null); setDeleteError(null); }}>
          <Plus className="h-4 w-4 mr-1.5" />Add location
        </Button>
      )}
    </div>
  );
}
