import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage, getNav } from "@/lib/cms";
import { PublicLayout } from "@/components/public/PublicLayout";
import { MarkdownRenderer } from "@/components/public/MarkdownRenderer";
import { SidebarBlock } from "@/components/public/SidebarBlock";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  if (!page) return {};
  return {
    title: `${page.title} — Wildheart Psychotherapy`,
    description: page.meta_description ?? undefined,
  };
}

export default async function RootPage() {
  const [page, nav] = await Promise.all([getPage("home"), getNav()]);
  if (!page) notFound();

  const sidebar = page.sidebar_block ? <SidebarBlock block={page.sidebar_block} /> : undefined;

  return (
    <PublicLayout nav={nav} sidebar={sidebar} imageUrl={page.image_url ?? undefined}>
      <article className="max-w-3xl mx-auto px-4 py-12">
        {page.content ? (
          <MarkdownRenderer content={page.content} />
        ) : (
          <h1 className="text-3xl font-bold text-stone-900">{page.title}</h1>
        )}
      </article>
      {page.footer_block && (
        <div className="border-t border-stone-100 px-4 py-10 max-w-3xl mx-auto">
          <SidebarBlock block={page.footer_block} />
        </div>
      )}
    </PublicLayout>
  );
}
