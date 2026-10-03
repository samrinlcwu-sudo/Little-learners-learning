export type LinkifiedSegment = { type: "text"; value: string } | { type: "link"; value: string };

/**
 * Only this site's own public section roots are ever turned into links —
 * never an arbitrary URL, never an external host — so a model reply can't
 * smuggle a link to somewhere else into the chat. The lookbehind/lookahead
 * keep it from matching inside words ("and/learn"), inside a longer URL, or
 * a prefix of a longer word ("/learning").
 */
const INTERNAL_PATH =
  /(?<![\w/.:-])(\/(?:learn|resources|games|blog|offerings|parents|teachers|admissions|about|support|faq|privacy|terms|sign-up|sign-in|dashboard)(?:\/[a-z0-9][a-z0-9-]*)*)(?![\w-])/g;

export function linkifyInternalPaths(text: string): LinkifiedSegment[] {
  const segments: LinkifiedSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INTERNAL_PATH)) {
    const start = match.index ?? 0;
    if (start > cursor) segments.push({ type: "text", value: text.slice(cursor, start) });
    segments.push({ type: "link", value: match[1] });
    cursor = start + match[0].length;
  }

  if (cursor < text.length) segments.push({ type: "text", value: text.slice(cursor) });
  return segments;
}
