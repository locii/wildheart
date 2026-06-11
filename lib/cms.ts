import { createServiceClient } from "@/lib/supabase/server";
import type { Page, PageWithBlocks, Article, NavItem, SidebarBlock } from "@/lib/supabase/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any;

export async function getPage(slug: string): Promise<PageWithBlocks | null> {
  const { data: page } = await db().from("pages").select("*").eq("slug", slug).single();
  if (!page) return null;

  // Fetch both blocks in parallel if assigned
  const [sidebarBlock, footerBlock] = await Promise.all([
    page.sidebar_block_id
      ? db().from("sidebar_blocks").select("*").eq("id", page.sidebar_block_id).single().then((r: { data: SidebarBlock | null }) => r.data)
      : null,
    page.footer_block_id
      ? db().from("sidebar_blocks").select("*").eq("id", page.footer_block_id).single().then((r: { data: SidebarBlock | null }) => r.data)
      : null,
  ]);

  return { ...page, sidebar_block: sidebarBlock ?? null, footer_block: footerBlock ?? null };
}

export async function getSidebarBlocks(): Promise<SidebarBlock[]> {
  const { data, error } = await db().from("sidebar_blocks").select("*").order("name");
  if (error) return [];
  return (data ?? []) as SidebarBlock[];
}

export async function getNav(): Promise<NavItem[]> {
  const { data } = await db().from("settings").select("value").eq("key", "nav").single();
  if (!data) return [];
  return data.value as NavItem[];
}

export async function getArticles(page = 1, perPage = 10): Promise<{ articles: Article[]; total: number }> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data, count } = await db()
    .from("articles")
    .select("*", { count: "exact" })
    .order("published_at", { ascending: false })
    .range(from, to);
  return { articles: (data ?? []) as Article[], total: count ?? 0 };
}

export async function getArticle(slug: string): Promise<Article | null> {
  const { data } = await db().from("articles").select("*").eq("slug", slug).single();
  return data ?? null;
}
