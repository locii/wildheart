import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticle, getNav } from "@/lib/cms";
import { PublicLayout } from "@/components/public/PublicLayout";
import { MarkdownRenderer } from "@/components/public/MarkdownRenderer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} — Wildheart Psychotherapy`,
    description: article.excerpt ?? undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, nav] = await Promise.all([getArticle(slug), getNav()]);
  if (!article) notFound();

  if (article.external_url) {
    return (
      <PublicLayout nav={nav}>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">{article.title}</h1>
          {article.excerpt && <p className="text-stone-600 mb-8">{article.excerpt}</p>}
          <a
            href={article.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
          >
            Read article →
          </a>
        </div>
      </PublicLayout>
    );
  }

  if (!article.content) notFound();

  return (
    <PublicLayout nav={nav}>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/resources"
          className="text-sm text-stone-500 hover:text-stone-700 transition-colors mb-8 block"
        >
          ← Resources
        </Link>
        {article.image_url && (
          <img
            src={article.image_url}
            alt=""
            className="w-full rounded-xl object-cover max-h-80 mb-8"
          />
        )}
        <MarkdownRenderer content={article.content} />
      </article>
    </PublicLayout>
  );
}
