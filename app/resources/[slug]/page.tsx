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

  const imageAndNav = article.image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <div className="w-full md:w-1/3 shrink-0">
      <img
        src={article.image_url}
        alt=""
        className="w-full rounded-xl bg-white md:p-4 p-1 shadow"
      />
      <Link
        href="/resources"
        className="text-sm text-stone-500 hover:text-stone-700 transition-colors mb-8 block mt-4"
      >
        ← Back to Resources
      </Link>
    </div>
  ) : null;

  if (article.external_url) {
    return (
      <PublicLayout nav={nav}>
        <article className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start -mt-28 relative z-10">
            {imageAndNav}
            <div className="flex-1 min-w-0 md:mt-24">
              <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4 leading-tight">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-stone-600 leading-relaxed mb-8">{article.excerpt}</p>
              )}
              <a
                href={article.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white! font-medium rounded-xl hover:bg-amber-600 transition-colors"
              >
                Read article →
              </a>
            </div>
          </div>
        </article>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout nav={nav}>
      <article className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start -mt-28 relative z-10">
          {imageAndNav}
          <div className="flex-1 min-w-0 md:mt-24">
            {article.content ? (
              <MarkdownRenderer content={article.content} />
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4 leading-tight">
                  {article.title}
                </h1>
                {article.excerpt && (
                  <p className="text-stone-600 leading-relaxed">{article.excerpt}</p>
                )}
              </>
            )}
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}
