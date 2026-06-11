export type Shortcode = {
  type: string;
  params: Record<string, string>;
};

export type ContentSegment =
  | { kind: "markdown"; text: string }
  | { kind: "shortcode"; raw: string; shortcode: Shortcode };

const SHORTCODE_RE = /\{%([^%]+)%\}/g;

export function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let last = 0;

  for (const match of content.matchAll(SHORTCODE_RE)) {
    if (match.index! > last) {
      segments.push({ kind: "markdown", text: content.slice(last, match.index) });
    }
    segments.push({ kind: "shortcode", raw: match[0], shortcode: parseShortcode(match[1]) });
    last = match.index! + match[0].length;
  }

  if (last < content.length) {
    segments.push({ kind: "markdown", text: content.slice(last) });
  }

  return segments;
}

function parseShortcode(inner: string): Shortcode {
  const parts = inner.trim().split("|");
  const type = parts[0].trim();
  const params: Record<string, string> = {};
  for (const part of parts.slice(1)) {
    const colon = part.indexOf(":");
    if (colon !== -1) {
      params[part.slice(0, colon).trim()] = part.slice(colon + 1).trim();
    }
  }
  return { type, params };
}
