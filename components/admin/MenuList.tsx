"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil } from "lucide-react";
import type { Menu } from "@/lib/supabase/types";

export function MenuList({ menus: initial }: { menus: Menu[] }) {
  const router = useRouter();
  const [menus, setMenus] = useState(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function toSlug(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function create() {
    if (!name.trim() || !slug.trim()) return;
    setCreating(true);
    const res = await fetch("/api/cms/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
    });
    if (res.ok) {
      const { menu } = await res.json();
      setMenus((m) => [...m, menu]);
      setName("");
      setSlug("");
      setShowForm(false);
      router.push(`/admin/menus/${menu.id}`);
    }
    setCreating(false);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {menus.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No menus yet.</p>
        )}
        {menus.map((m) => (
          <div key={m.id} className="flex items-center gap-3 bg-card border rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.slug}</div>
            </div>
            <Link href={`/admin/menus/${m.id}`}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium">New menu</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Name</label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(toSlug(e.target.value));
                }}
                placeholder="Main Navigation"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Slug (unique key)</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(toSlug(e.target.value))}
                placeholder="main-nav"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={create} disabled={creating || !name.trim() || !slug.trim()}>
              {creating ? "Creating…" : "Create"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />New menu
        </Button>
      )}
    </div>
  );
}
