"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, Trash2 } from "lucide-react";
import type { SidebarBlock } from "@/lib/supabase/types";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function SidebarBlockEditor({ block, isNew = false }: { block: SidebarBlock; isNew?: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(block.name);
  const [imageUrl, setImageUrl] = useState(block.image_url ?? "");
  const [buttonLabel, setButtonLabel] = useState(block.button_label ?? "");
  const [buttonUrl, setButtonUrl] = useState(block.button_url ?? "");
  const [body, setBody] = useState(block.body ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const payload = {
      name,
      image_url: imageUrl || null,
      button_label: buttonLabel || null,
      button_url: buttonUrl || null,
      body: body || null,
    };
    if (isNew) {
      const res = await fetch("/api/cms/sidebar-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const { sidebar_block: created } = await res.json();
      router.push(`/admin/sidebar-blocks/${created.id}`);
    } else {
      await fetch(`/api/cms/sidebar-blocks/${block.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    }
  }

  async function deleteBlock() {
    if (!confirm("Delete this sidebar block? Pages using it will lose their sidebar.")) return;
    await fetch(`/api/cms/sidebar-blocks/${block.id}`, { method: "DELETE" });
    router.push("/admin/sidebar-blocks");
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs">Block name (admin only)</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Men's Groups CTA" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Image URL</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          type="url"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Button label</Label>
          <Input value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} placeholder="Book now" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Button URL</Label>
          <Input value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} placeholder="https://..." type="url" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Body (Markdown)</Label>
        <div data-color-mode="dark">
          <MDEditor value={body} onChange={(v) => setBody(v ?? "")} height={220} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving || !name}>
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
          ) : saved ? (
            <><Check className="h-4 w-4 mr-2" />Saved</>
          ) : isNew ? (
            "Create block"
          ) : (
            "Save block"
          )}
        </Button>
        {!isNew && (
          <Button variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive" onClick={deleteBlock}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
