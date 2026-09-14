import type { ContentAuthor } from "@/lib/content/types";

/**
 * `Person` for a named teacher, `Organization` for the platform itself —
 * never the reverse, and never a fabricated field beyond the real name
 * (Prompt 70: "structured data contains only truthful information").
 * Every resource/article detail page previously emitted `Organization`
 * unconditionally, which was quietly wrong for a teacher-authored piece —
 * a person isn't an organization. No `url` is included for a `Person`:
 * these pages render server-side and have no way to know whether *this*
 * visitor's browser happens to hold that teacher's public profile (see
 * src/lib/accounts/author-profile-link.ts, which only ever resolves that
 * client-side) — omitting the field is correct here, not a placeholder
 * for one that "should" be added later.
 */
export function buildAuthorSchema(author: ContentAuthor): { "@type": "Person" | "Organization"; name: string } {
  if (author.role === "teacher") {
    return { "@type": "Person", name: author.name };
  }
  return { "@type": "Organization", name: author.name };
}

export interface TeacherPersonSchemaInput {
  name: string;
  url: string;
  /** headline preferred over bio when both exist — a one-line description fits `description` better than a full multi-paragraph bio. */
  headline?: string;
  bio?: string;
  /** Real subject/expertise names this teacher entered themselves — never a fabricated specialty. */
  knowsAbout?: string[];
}

/**
 * The teacher's own public profile page (/teachers/p/[slug]) is the one
 * place a `Person` deserves a full, real schema — every field here is
 * something the teacher actually entered. Deliberately excludes `image`:
 * a teacher's photo is stored as a base64 data URL
 * (docs/TEACHER_ARCHITECTURE.md), and inlining that into a JSON-LD block
 * would bloat the page by the photo's full size a second time — the real
 * `<img>` tag already renders it visibly, with real alt text, which is
 * what matters for both users and accessibility. Also excludes
 * `alumniOf`/`hasCredential`: `education`/`certifications` are free-text
 * fields a teacher typed themselves, not necessarily a clean institution
 * name schema.org's structured properties expect — forcing free text into
 * the wrong structured shape would be less honest than leaving it as
 * plain page content.
 */
export function buildTeacherPersonSchema(input: TeacherPersonSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    url: input.url,
    ...(input.headline || input.bio ? { description: input.headline || input.bio } : {}),
    ...(input.knowsAbout && input.knowsAbout.length > 0 ? { knowsAbout: input.knowsAbout } : {}),
  };
}
