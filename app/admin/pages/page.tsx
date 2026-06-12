import { createServiceClient } from "@/lib/supabase/server";
import { PageList } from "@/components/admin/PageList";
import { getMenuNav } from "@/lib/cms";
import type { NavItem } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageRow = { slug: string; title: string; updated_at: string; is_public: boolean };

function flattenNavHrefs(items: NavItem[]): string[] {
  // "home" slug maps to "/" which doesn't appear in the nav — pin it first
  const hrefs: string[] = ["/"];
  for (const item of items) {
    if (item.href) hrefs.push(item.href);
    if (item.children) {
      for (const child of item.children) {
        if (child.href) hrefs.push(child.href);
      }
    }
  }
  return hrefs;
}

export default async function PagesListPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const [{ data: pages }, nav] = await Promise.all([
    supabase.from("pages").select("slug, title, updated_at, is_public"),
    getMenuNav("main-nav"),
  ]);

  const navHrefs = flattenNavHrefs(nav);
  const navOrder = new Map(navHrefs.map((href, i) => [href, i]));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Pages</h1>
      </div>
      <PageList pages={(pages ?? []) as PageRow[]} navOrder={navOrder} />
    </div>
  );
}
