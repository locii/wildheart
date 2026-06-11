"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "./SearchInput";
import { Pencil, Plus, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { Article } from "@/lib/supabase/types";

export function ArticleList({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? articles.filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        (a.slug ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : articles;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder="Search articles…" />
        </div>
        <Link href="/admin/resources/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />New article
          </Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {query ? "No articles match your search." : "No articles yet."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((article) => (
            <div key={article.id} className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm truncate">{article.title}</p>
                  {article.external_url && (
                    <Badge variant="outline" className="text-[10px] py-0 gap-1">
                      <ExternalLink className="h-2.5 w-2.5" />External
                    </Badge>
                  )}
                </div>
                {article.slug && (
                  <p className="text-xs text-muted-foreground">/resources/{article.slug}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {format(new Date(article.published_at), "d MMM yyyy")}
              </span>
              <Link href={`/admin/resources/${article.id}`}>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {query && (
        <p className="text-xs text-muted-foreground mt-3">
          {filtered.length} of {articles.length} articles
        </p>
      )}
    </div>
  );
}
