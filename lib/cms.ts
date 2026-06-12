import { createServiceClient } from "@/lib/supabase/server";
import type { Page, PageWithBlocks, Article, NavItem, SidebarBlock, Menu, MenuWithItems } from "@/lib/supabase/types";

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
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range(from, to);
  return { articles: (data ?? []) as Article[], total: count ?? 0 };
}

export async function getArticle(slug: string): Promise<Article | null> {
  const { data } = await db().from("articles").select("*").eq("slug", slug).single();
  return data ?? null;
}

// ─── Articles by parent slug prefix ───────────────────────────────────────────
export async function getArticlesByParent(parentSlug: string, limit = 6): Promise<Article[]> {
  const { data } = await db()
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Article[];
}

export async function getPagesByParent(parentSlug: string, limit = 12): Promise<Page[]> {
  const { data } = await db()
    .from("pages")
    .select("*")
    .like("slug", `${parentSlug}/%`)
    .eq("is_public", true)
    .order("slug");
  return ((data ?? []) as Page[]).slice(0, limit);
}

// ─── Menus ────────────────────────────────────────────────────────────────────
export async function getMenus(): Promise<Menu[]> {
  const { data } = await db().from("menus").select("*").order("name");
  return (data ?? []) as Menu[];
}

export async function getMenuById(id: string): Promise<MenuWithItems | null> {
  const { data: menu } = await db().from("menus").select("*").eq("id", id).single();
  if (!menu) return null;

  const { data: items } = await db()
    .from("menu_items")
    .select(`*, article:article_id ( id, slug, title ), appointment_type:appointment_type_id ( id, name )`)
    .eq("menu_id", id)
    .order("position");

  return { ...menu, items: (items ?? []).map((i: Record<string, unknown>) => ({ ...i, page: null })) } as MenuWithItems;
}

/** Convert menu items to NavItem[] tree for use in nav components. */
export async function getMenuNav(menuSlug: string): Promise<NavItem[]> {
  const { data: menu } = await db().from("menus").select("id").eq("slug", menuSlug).single();
  if (!menu) return getNav(); // fall back to settings nav

  const { data: items } = await db()
    .from("menu_items")
    .select(`*, article:article_id ( id, slug, title ), appointment_type:appointment_type_id ( id, name )`)
    .eq("menu_id", menu.id)
    .is("parent_id", null)
    .order("position");

  if (!items) return [];

  return Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items.map(async (item: any) => {
      const href = resolveHref(item);
      const { data: children } = await db()
        .from("menu_items")
        .select(`*, article:article_id(id,slug,title), appointment_type:appointment_type_id(id,name)`)
        .eq("parent_id", item.id)
        .order("position");

      const navItem: NavItem = { label: item.label, href };
      if (children?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navItem.children = children.map((c: any) => ({ label: c.label, href: resolveHref(c) }));
        delete navItem.href;
      }
      return navItem;
    })
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveHref(item: any): string | undefined {
  if (item.type === "page" && item.page_slug) return `/${item.page_slug}`;
  if (item.type === "article" && item.article?.slug) return `/resources/${item.article.slug}`;
  if (item.type === "appointment_type") return "/appointments";
  if (item.type === "url" && item.url) return item.url;
  return undefined;
}
