"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import type { Page, SidebarBlock } from "@/lib/supabase/types";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function PageEditor({ page, sidebarBlocks = [] }: { page: Page; sidebarBlocks?: SidebarBlock[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(page.title);
  const [metaDescription, setMetaDescription] = useState(page.meta_description ?? "");
  const [imageUrl, setImageUrl] = useState(page.image_url ?? "");
  const [sidebarBlockId, setSidebarBlockId] = useState(page.sidebar_block_id ?? "");
  const [footerBlockId, setFooterBlockId] = useState(page.footer_block_id ?? "");
  const [asideClass, setAsideClass] = useState(page.aside_class ?? "");
  const [isPublic, setIsPublic] = useState(page.is_public ?? true);
  const [content, setContent] = useState(page.content ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/cms/pages/${encodeURIComponent(page.slug)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        meta_description: metaDescription,
        image_url: imageUrl || null,
        sidebar_block_id: sidebarBlockId || null,
        footer_block_id: footerBlockId || null,
        aside_class: asideClass || null,
        is_public: isPublic,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const saveButton = (
    <Button onClick={save} disabled={saving}>
      {saving ? (
        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
      ) : saved ? (
        <><Check className="h-4 w-4 mr-2" />Saved</>
      ) : (
        "Save page"
      )}
    </Button>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-2 border-b">
        {saveButton}
        <a
          href={`/${page.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View →
        </a>
        <label className="flex items-center gap-2 ml-auto cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-muted-foreground">{isPublic ? "Public" : "Unlisted"}</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Page title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Meta description</Label>
          <Input
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Short description for search engines"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Image URL</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://... (used as hero image)"
          type="url"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Sidebar block</Label>
          <select
            value={sidebarBlockId}
            onChange={(e) => setSidebarBlockId(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">— None —</option>
            {sidebarBlocks.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Footer block</Label>
          <select
            value={footerBlockId}
            onChange={(e) => setFooterBlockId(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">— None —</option>
            {sidebarBlocks.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Aside CSS classes</Label>
        <Input
          value={asideClass}
          onChange={(e) => setAsideClass(e.target.value)}
          placeholder="CSS class name, e.g. aside-booking"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Content (Markdown)</Label>
        <div data-color-mode="dark">
          <MDEditor
            value={content}
            onChange={(v) => setContent(v ?? "")}
            height={500}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t">
        {saveButton}
        <a
          href={`/${page.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View →
        </a>
      </div>
    </div>
  );
}
