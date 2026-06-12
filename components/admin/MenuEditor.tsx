"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Trash2, Plus, ChevronRight, Loader2 } from "lucide-react";
import type { MenuWithItems, MenuItemWithRef, MenuItemType, AppointmentType, Article, Page } from "@/lib/supabase/types";

type ItemDraft = {
  label: string;
  type: MenuItemType;
  page_slug: string;
  article_id: string;
  appointment_type_id: string;
  url: string;
  description: string;
  open_in_new_tab: boolean;
  parent_id: string | null;
};

const EMPTY_DRAFT: ItemDraft = {
  label: "",
  type: "page",
  page_slug: "",
  article_id: "",
  appointment_type_id: "",
  url: "",
  description: "",
  open_in_new_tab: false,
  parent_id: null,
};

export function MenuEditor({
  menu: initial,
  pages,
  articles,
  appointmentTypes,
}: {
  menu: MenuWithItems;
  pages: Pick<Page, "slug" | "title">[];
  articles: Pick<Article, "id" | "slug" | "title">[];
  appointmentTypes: Pick<AppointmentType, "id" | "name">[];
}) {
  const router = useRouter();
  const [menu, setMenu] = useState(initial);
  const [menuName, setMenuName] = useState(initial.name);
  const [savingName, setSavingName] = useState(false);
  const [addingParentId, setAddingParentId] = useState<string | null | "root">(null);
  const [draft, setDraft] = useState<ItemDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const rootItems = menu.items.filter((i) => !i.parent_id);

  // ── helpers ──────────────────────────────────────────────────────────────────

  async function saveName() {
    setSavingName(true);
    await fetch(`/api/cms/menus/${menu.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: menuName }),
    });
    setSavingName(false);
    router.refresh();
  }

  async function reorder(items: MenuItemWithRef[], fromIdx: number, toIdx: number) {
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const positions = reordered.map((it, i) => ({ id: it.id, position: i }));

    setMenu((m) => ({
      ...m,
      items: m.items.map((it) => {
        const pos = positions.find((p) => p.id === it.id);
        return pos ? { ...it, position: pos.position } : it;
      }),
    }));

    await fetch(`/api/cms/menus/${menu.id}/items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positions }),
    });
  }

  async function deleteItem(id: string) {
    setDeleting(id);
    await fetch(`/api/cms/menus/${menu.id}/items/${id}`, { method: "DELETE" });
    setMenu((m) => ({ ...m, items: m.items.filter((it) => it.id !== id) }));
    setDeleting(null);
    setConfirmDelete(null);
  }

  async function addItem() {
    if (!draft.label.trim()) return;
    setSaving(true);

    const payload: Record<string, unknown> = {
      label: draft.label.trim(),
      type: draft.type,
      parent_id: addingParentId === "root" ? null : addingParentId,
      description: draft.description || null,
      open_in_new_tab: draft.open_in_new_tab,
    };
    if (draft.type === "page") payload.page_slug = draft.page_slug || null;
    if (draft.type === "article") payload.article_id = draft.article_id || null;
    if (draft.type === "appointment_type") payload.appointment_type_id = draft.appointment_type_id || null;
    if (draft.type === "url") payload.url = draft.url || null;

    const res = await fetch(`/api/cms/menus/${menu.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const { item } = await res.json();
      setMenu((m) => ({ ...m, items: [...m.items, item] }));
      setDraft(EMPTY_DRAFT);
      setAddingParentId(null);
    }
    setSaving(false);
  }

  // ── item row ──────────────────────────────────────────────────────────────────

  function ItemRow({ item, siblings, idx }: { item: MenuItemWithRef; siblings: MenuItemWithRef[]; idx: number }) {
    const children = menu.items.filter((i) => i.parent_id === item.id).sort((a, b) => a.position - b.position);
    const isConfirming = confirmDelete === item.id;

    const href = item.type === "page" && item.page_slug
      ? `/${item.page_slug}`
      : item.type === "article" && item.article?.slug
      ? `/resources/${item.article.slug}`
      : item.type === "url"
      ? item.url ?? ""
      : item.type === "appointment_type"
      ? "/appointments"
      : "";

    return (
      <div>
        <div className="flex items-center gap-2 bg-card border rounded-xl px-3 py-2.5">
          {/* reorder */}
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={idx === 0}
              onClick={() => reorder(siblings, idx, idx - 1)}
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={idx === siblings.length - 1}
              onClick={() => reorder(siblings, idx, idx + 1)}
            >
              <ArrowDown className="h-3 w-3" />
            </button>
          </div>

          {/* label + href */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{item.label}</div>
            {href && <div className="text-xs text-muted-foreground truncate">{href}</div>}
          </div>

          {/* type badge */}
          <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {item.type}
          </span>

          {/* sub-item button (only on root items) */}
          {!item.parent_id && (
            <button
              className="shrink-0 text-muted-foreground hover:text-foreground"
              title="Add sub-item"
              onClick={() => { setAddingParentId(item.id); setDraft(EMPTY_DRAFT); }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* delete */}
          {isConfirming ? (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="destructive"
                className="h-6 px-2 text-xs"
                onClick={() => deleteItem(item.id)}
                disabled={deleting === item.id}
              >
                {deleting === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
              </Button>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* children */}
        {children.length > 0 && (
          <div className="pl-6 mt-1 space-y-1 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-border">
            {children.map((child, ci) => (
              <ItemRow key={child.id} item={child} siblings={children} idx={ci} />
            ))}
            {addingParentId === item.id && (
              <AddItemForm parentId={item.id} />
            )}
          </div>
        )}
        {children.length === 0 && addingParentId === item.id && (
          <div className="pl-6 mt-1">
            <AddItemForm parentId={item.id} />
          </div>
        )}
      </div>
    );
  }

  // ── add form ──────────────────────────────────────────────────────────────────

  function AddItemForm({ parentId }: { parentId: string | null }) {
    return (
      <div className="bg-muted/50 border border-dashed rounded-xl p-3 space-y-2.5">
        <p className="text-xs font-medium text-muted-foreground">
          {parentId ? "Add sub-item" : "Add item"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Label</label>
            <Input
              value={draft.label}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              placeholder="Services"
              autoFocus
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Type</label>
            <select
              value={draft.type}
              onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as MenuItemType }))}
              className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="page">Page</option>
              <option value="article">Article</option>
              <option value="appointment_type">Booking type</option>
              <option value="url">Custom URL</option>
            </select>
          </div>
        </div>

        {/* type-specific reference */}
        {draft.type === "page" && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Page</label>
            <select
              value={draft.page_slug}
              onChange={(e) => setDraft((d) => ({ ...d, page_slug: e.target.value }))}
              className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="">— Select page —</option>
              {pages.map((p) => (
                <option key={p.slug} value={p.slug}>{p.title} (/{p.slug})</option>
              ))}
            </select>
          </div>
        )}
        {draft.type === "article" && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Article</label>
            <select
              value={draft.article_id}
              onChange={(e) => setDraft((d) => ({ ...d, article_id: e.target.value }))}
              className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="">— Select article —</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        )}
        {draft.type === "appointment_type" && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Booking type</label>
            <select
              value={draft.appointment_type_id}
              onChange={(e) => setDraft((d) => ({ ...d, appointment_type_id: e.target.value }))}
              className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="">— Select type —</option>
              {appointmentTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
        {draft.type === "url" && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">URL</label>
            <Input
              value={draft.url}
              onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
              placeholder="https://..."
              className="h-8 text-sm"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Description (optional)</label>
          <Input
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="Short description shown in mega-menus"
            className="h-8 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={draft.open_in_new_tab}
            onChange={(e) => setDraft((d) => ({ ...d, open_in_new_tab: e.target.checked }))}
          />
          Open in new tab
        </label>

        <div className="flex gap-2">
          <Button size="sm" onClick={addItem} disabled={saving || !draft.label.trim()}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAddingParentId(null)}>Cancel</Button>
        </div>
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Menu name */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Input
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
          className="max-w-xs font-medium"
        />
        <Button size="sm" variant="outline" onClick={saveName} disabled={savingName}>
          {savingName ? "Saving…" : "Rename"}
        </Button>
        <span className="text-xs text-muted-foreground ml-auto font-mono">{menu.slug}</span>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {rootItems.sort((a, b) => a.position - b.position).map((item, idx) => (
          <ItemRow key={item.id} item={item} siblings={rootItems} idx={idx} />
        ))}
      </div>

      {/* Add root item */}
      {addingParentId === "root" ? (
        <AddItemForm parentId={null} />
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => { setAddingParentId("root"); setDraft(EMPTY_DRAFT); }}
        >
          <Plus className="h-4 w-4 mr-1.5" />Add item
        </Button>
      )}
    </div>
  );
}
