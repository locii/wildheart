"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function NewPageForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9/]+/g, "-").replace(/^-|-$/g, "");
  }

  async function create() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/cms/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slug || slugify(title), title }),
    });
    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg ?? "Failed to create page");
      setSaving(false);
      return;
    }
    const { page } = await res.json();
    router.push(`/admin/pages/${encodeURIComponent(page.slug)}`);
  }

  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-1.5">
        <Label className="text-xs">Page title</Label>
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) setSlug(slugify(e.target.value));
          }}
          placeholder="e.g. Privacy Policy"
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Slug</Label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. privacy-policy or services/new-service"
        />
        <p className="text-xs text-muted-foreground">Public URL: /{slug || slugify(title)}</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={create} disabled={saving || !title}>
        {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : "Create page"}
      </Button>
    </div>
  );
}
