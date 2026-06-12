"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Check, X, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { AppointmentType } from "@/lib/supabase/types";

type Draft = { name: string; duration_minutes: string; price: string; slug: string };

const emptyDraft = (): Draft => ({ name: "", duration_minutes: "", price: "", slug: "" });

export function ServicesEditor() {
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft());
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/types");
    const { types: data } = await res.json();
    setTypes(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(t: AppointmentType) {
    setEditingId(t.id);
    setEditDraft({ name: t.name, duration_minutes: String(t.duration_minutes), price: String(t.price), slug: t.slug ?? "" });
    setAdding(false);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch(`/api/types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editDraft.name.trim(),
        duration_minutes: parseInt(editDraft.duration_minutes),
        price: parseFloat(editDraft.price),
        slug: editDraft.slug.trim() || null,
      }),
    });
    setEditingId(null);
    await load();
    setSaving(false);
  }

  async function toggleActive(t: AppointmentType) {
    await fetch(`/api/types/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !t.is_active }),
    });
    await load();
  }

  async function togglePublic(t: AppointmentType) {
    await fetch(`/api/types/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: !t.is_public }),
    });
    await load();
  }

  async function deleteType(id: string) {
    if (!confirm("Delete this service type? This will fail if any appointments use it.")) return;
    const res = await fetch(`/api/types/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Cannot delete — appointments may reference this type." }));
      alert(error);
      return;
    }
    await load();
  }

  async function addType() {
    setSaving(true);
    await fetch("/api/types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addDraft.name.trim(),
        duration_minutes: parseInt(addDraft.duration_minutes),
        price: parseFloat(addDraft.price),
        slug: addDraft.slug.trim() || null,
      }),
    });
    setAdding(false);
    setAddDraft(emptyDraft());
    await load();
    setSaving(false);
  }

  if (loading) return <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {types.map((t) => (
          <div key={t.id} className={`bg-card border rounded-xl px-4 py-3 transition-opacity ${t.is_active ? "" : "opacity-50"}`}>
            {editingId === t.id ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Duration (min)</Label>
                    <Input type="number" value={editDraft.duration_minutes} onChange={(e) => setEditDraft({ ...editDraft, duration_minutes: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Price ($)</Label>
                    <Input type="number" value={editDraft.price} onChange={(e) => setEditDraft({ ...editDraft, price: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">URL slug</Label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground shrink-0">/appointments/</span>
                    <Input
                      value={editDraft.slug}
                      onChange={(e) => setEditDraft({ ...editDraft, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                      placeholder="e.g. breathwork-3-hour"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => saveEdit(t.id)} disabled={saving || !editDraft.name.trim()}>
                    <Check className="h-3.5 w-3.5 mr-1.5" />Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5 mr-1.5" />Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{t.name}</span>
                    {!t.is_active && <Badge variant="outline" className="text-[10px] py-0">Inactive</Badge>}
                    {!t.is_public && <Badge variant="outline" className="text-[10px] py-0 border-amber-300 text-amber-700">Admin only</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.duration_minutes} min · {t.price > 0 ? `$${t.price}` : "Free"}
                    {t.slug && <span className="ml-2 opacity-60">/appointments/{t.slug}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => startEdit(t)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => togglePublic(t)}
                    title={t.is_public ? "Hide from public" : "Show to public"}>
                    {t.is_public ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-amber-500" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => toggleActive(t)}
                    title={t.is_active ? "Deactivate" : "Activate"}>
                    {t.is_active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => deleteType(t.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="bg-card border rounded-xl px-4 py-4 space-y-3">
          <p className="text-sm font-medium">New service type</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input
              placeholder="e.g. Breathwork Session"
              value={addDraft.name}
              onChange={(e) => setAddDraft({ ...addDraft, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Duration (min)</Label>
              <Input
                type="number"
                placeholder="60"
                value={addDraft.duration_minutes}
                onChange={(e) => setAddDraft({ ...addDraft, duration_minutes: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Price ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={addDraft.price}
                onChange={(e) => setAddDraft({ ...addDraft, price: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">URL slug</Label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground shrink-0">/appointments/</span>
              <Input
                placeholder="e.g. breathwork-3-hour"
                value={addDraft.slug}
                onChange={(e) => setAddDraft({ ...addDraft, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={addType} disabled={saving || !addDraft.name.trim() || !addDraft.duration_minutes}>
              <Check className="h-3.5 w-3.5 mr-1.5" />Add service
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setAdding(false); setAddDraft(emptyDraft()); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => { setAdding(true); setEditingId(null); }}>
          <Plus className="h-4 w-4 mr-1.5" />Add service type
        </Button>
      )}
    </div>
  );
}
