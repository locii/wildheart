"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, Trash2 } from "lucide-react";
import type { Article } from "@/lib/supabase/types";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type Mode = "full" | "external";

export function ArticleEditor({ article, isNew = false }: { article: Article; isNew?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug ?? "");
  const [excerpt, setExcerpt] = useState(article.excerpt ?? "");
  const [content, setContent] = useState(article.content ?? "");
  const [externalUrl, setExternalUrl] = useState(article.external_url ?? "");
  const [imageUrl, setImageUrl] = useState(article.image_url ?? "");
  const [mode, setMode] = useState<Mode>(article.external_url ? "external" : "full");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function save() {
    setSaving(true);
    const body = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content: mode === "full" ? content : null,
      external_url: mode === "external" ? externalUrl : null,
      image_url: imageUrl || null,
    };
    if (isNew) {
      const res = await fetch("/api/cms/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const { article: created } = await res.json();
      router.push(`/admin/resources/${created.id}`);
    } else {
      await fetch(`/api/cms/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    }
  }

  async function deleteArticle() {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    await fetch(`/api/cms/articles/${article.id}`, { method: "DELETE" });
    router.push("/admin/resources");
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs">Title</Label>
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) setSlug(slugify(e.target.value));
          }}
          placeholder="Article title"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Slug (URL)</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="article-slug"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Type</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("full")}
              className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                mode === "full"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input hover:bg-muted/50"
              }`}
            >
              Full article
            </button>
            <button
              type="button"
              onClick={() => setMode("external")}
              className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                mode === "external"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input hover:bg-muted/50"
              }`}
            >
              External link
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Excerpt</Label>
        <Textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary shown in the article list"
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Image URL</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://... (used as hero image and stub thumbnail)"
          type="url"
        />
      </div>

      {mode === "external" ? (
        <div className="space-y-1.5">
          <Label className="text-xs">External URL</Label>
          <Input
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://..."
            type="url"
          />
        </div>
      ) : (
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
      )}

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving || !title}>
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
          ) : saved ? (
            <><Check className="h-4 w-4 mr-2" />Saved</>
          ) : isNew ? (
            "Create article"
          ) : (
            "Save article"
          )}
        </Button>
        {!isNew && slug && (
          <a
            href={`/resources/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View →
          </a>
        )}
        {!isNew && (
          <Button variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive" onClick={deleteArticle}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
