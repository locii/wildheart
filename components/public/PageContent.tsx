import { parseContent } from "@/lib/shortcodes";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { EventsCalendar } from "./EventsCalendar";

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

      return null;
    })
  );

  return <>{rendered}</>;
}
