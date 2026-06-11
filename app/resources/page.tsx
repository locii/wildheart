import Link from "next/link";
import type { Metadata } from "next";
import { getArticles, getNav } from "@/lib/cms";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resources — Wildheart Psychotherapy",
  description: "Articles on psychotherapy, breathwork, men's groups, and related topics.",
};

const PER_PAGE = 10;

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const [{ articles, total }, nav] = await Promise.all([getArticles(page, PER_PAGE), getNav()]);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <PublicLayout nav={nav}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">Resources</h1>
        <p className="text-stone-500 mb-10">Articles on psychotherapy, breathwork, men&apos;s groups, and related topics.</p>

        <div className="space-y-6">
          {articles.map((article) => (
            <article key={article.id} className="group border-b border-stone-200 pb-6 last:border-0">
              {article.external_url ? (
                <a
                  href={article.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4"
                >
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg shrink-0 mt-0.5"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-stone-900 group-hover:text-amber-700 transition-colors flex items-center gap-2">
                      {article.title}
                      <ExternalLink className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    </h2>
                    {article.excerpt && (
                      <p className="mt-1.5 text-stone-600 text-sm leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </a>
              ) : (
                <Link href={`/resources/${article.slug}`} className="flex gap-4">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg shrink-0 mt-0.5"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="mt-1.5 text-stone-600 text-sm leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              )}
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="flex items-center justify-between mt-10 pt-6 border-t border-stone-200">
            {page > 1 ? (
              <Link
                href={`/resources?page=${page - 1}`}
                className="px-4 py-2 text-sm font-medium border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
              >
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm text-stone-500">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/resources?page=${page + 1}`}
                className="px-4 py-2 text-sm font-medium border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </PublicLayout>
  );
}
