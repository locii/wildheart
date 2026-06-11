import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage, getNav } from "@/lib/cms";
import { PublicLayout } from "@/components/public/PublicLayout";
import { PageContent } from "@/components/public/PageContent";
import { SidebarBlock } from "@/components/public/SidebarBlock";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  if (!page) return {};
  return {
    title: `${page.title} — Wildheart Psychotherapy`,
    description: page.meta_description ?? undefined,
  };
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const [page, nav] = await Promise.all([getPage(slug.join("/")), getNav()]);
  if (!page) notFound();

  const sidebar = page.sidebar_block ? <SidebarBlock block={page.sidebar_block} /> : undefined;

  return (
    <PublicLayout nav={nav} sidebar={sidebar} imageUrl={page.image_url ?? undefined} asideClassName={page.aside_class ?? undefined}>
      <article className="max-w-3xl mx-auto px-4 py-12">
        
        {page.content ? (
          <PageContent content={page.content} />
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
