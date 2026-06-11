"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./SearchInput";
import { Pencil, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type PageRow = { slug: string; title: string; updated_at: string };
type TreeNode = { page: PageRow; children: TreeNode[] };

function buildTree(pages: PageRow[], navOrder: Map<string, number>): TreeNode[] {
  // Sort alphabetically first so parent slugs always precede children
  const sorted = [...pages].sort((a, b) => a.slug.localeCompare(b.slug));
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const page of sorted) {
    const node: TreeNode = { page, children: [] };
    nodeMap.set(page.slug, node);
    const lastSlash = page.slug.lastIndexOf("/");
    if (lastSlash === -1) {
      roots.push(node);
    } else {
      const parentSlug = page.slug.slice(0, lastSlash);
      const parent = nodeMap.get(parentSlug);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  }

  const navIdx = (slug: string) => {
    // "home" slug lives at "/" on the public site
    const href = slug === "home" ? "/" : "/" + slug;
    return navOrder.get(href) ?? Infinity;
  };

  const byNav = (a: TreeNode, b: TreeNode) => {
    const ai = navIdx(a.page.slug);
    const bi = navIdx(b.page.slug);
    return ai !== bi ? ai - bi : a.page.slug.localeCompare(b.page.slug);
  };

  const sortNodes = (nodes: TreeNode[]): TreeNode[] =>
    nodes.sort(byNav).map((n) => ({ ...n, children: sortNodes(n.children) }));

  return sortNodes(roots);
}

function PageItem({ page }: { page: PageRow }) {
  return (
    <div className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <Link href={`/admin/pages/${encodeURIComponent(page.slug)}`} className="font-medium text-sm truncate hover:underline block">
          {page.title}
        </Link>
        <p className="text-xs text-muted-foreground">/{page.slug}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
      </span>
      <Link href={`/admin/pages/${encodeURIComponent(page.slug)}`}>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}

function PageTree({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) {
  return (
    <div className="space-y-2">
      {nodes.map(({ page, children }) => (
        <div key={page.slug}>
          <div style={depth > 0 ? { paddingLeft: `${depth * 20}px` } : undefined} className="relative">
            {depth > 0 && (
              <div className="absolute left-0 top-0 bottom-0 flex items-stretch" style={{ width: `${depth * 20}px` }}>
                <div className="ml-2.5 border-l border-b border-border/50 rounded-bl-sm w-3 mt-4 mb-auto h-4" />
              </div>
            )}
            <PageItem page={page} />
          </div>
          {children.length > 0 && <PageTree nodes={children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  );
}

export function PageList({ pages, navOrder = new Map() }: { pages: PageRow[]; navOrder?: Map<string, number> }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? pages.filter(
        (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      )
    : null;

  const tree = buildTree(pages, navOrder);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder="Search pages…" />
        </div>
        <Link href="/admin/pages/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />New page
          </Button>
        </Link>
      </div>

      {filtered ? (
        filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No pages match your search.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((page) => <PageItem key={page.slug} page={page} />)}
            <p className="text-xs text-muted-foreground mt-1">{filtered.length} of {pages.length} pages</p>
          </div>
        )
      ) : (
        <PageTree nodes={tree} />
      )}
    </div>
  );
}
