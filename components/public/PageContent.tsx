import { parseContent } from "@/lib/shortcodes";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { EventsCalendar } from "./EventsCalendar";
import { ContentGrid } from "./ContentGrid";
import { getArticlesByParent, getPagesByParent, getArticles } from "@/lib/cms";

async function fetchFeed(params: Record<string, string>) {
  const domain = params.domain;
  if (!domain) return null;

  const url = new URL(`https://${domain}/api/events`);
  if (params.filter === "future") url.searchParams.set("future", "1");
  if (params.filter === "past") url.searchParams.set("past", "1");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function PageContent({ content }: { content: string }) {
  const segments = parseContent(content);

  const rendered = await Promise.all(
    segments.map(async (seg) => {
      if (seg.kind === "markdown") {
        return <MarkdownRenderer key={seg.text.slice(0, 20)} content={seg.text} />;
      }

      const { shortcode } = seg;

      if (shortcode.type === "feed" && shortcode.params.model === "events") {
        const events = await fetchFeed(shortcode.params);
        if (!events) return null;
        return <EventsCalendar key={seg.raw} events={events} />;
      }

      // {%article-grid|source:articles|limit:3%}
      // {%article-grid|source:pages|parent:services|limit:6%}
      if (shortcode.type === "article-grid") {
        const limit = parseInt(shortcode.params.limit ?? "6", 10);
        const cols = parseInt(shortcode.params.cols ?? "3", 10);
        const source = shortcode.params.source ?? "articles";
        if (source === "pages" && shortcode.params.parent) {
          const items = await getPagesByParent(shortcode.params.parent, limit);
          return <ContentGrid key={seg.raw} cols={cols} items={items.map((p) => ({ title: p.title, href: `/${p.slug}`, excerpt: p.meta_description ?? undefined, image: p.image_url ?? undefined }))} />;
        }
        if (source === "articles" && shortcode.params.parent) {
          const items = await getArticlesByParent(shortcode.params.parent, limit);
          return <ContentGrid key={seg.raw} cols={cols} items={items.map((a) => ({ title: a.title, href: a.slug ? `/resources/${a.slug}` : "#", excerpt: a.excerpt ?? undefined, image: a.image_url ?? undefined }))} />;
        }
        const { articles } = await getArticles(1, limit);
        return <ContentGrid key={seg.raw} cols={cols} items={articles.map((a) => ({ title: a.title, href: a.slug ? `/resources/${a.slug}` : "#", excerpt: a.excerpt ?? undefined, image: a.image_url ?? undefined }))} />;
      }

      return null;
    })
  );

  return <>{rendered}</>;
}
