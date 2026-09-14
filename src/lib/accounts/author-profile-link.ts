import type { ContentAuthor } from "@/lib/content/types";
import { canViewTeacherProfile } from "./teacher-visibility";
import type { TeacherProfile } from "./types";

/**
 * The one place "does this content's author have a real, linkable page"
 * is decided (Prompt 70) — pure and synchronous so it's easily tested,
 * with a thin `useAuthorProfileHref` hook (./use-author-profile-link.ts)
 * wrapping it for reactive callers.
 *
 * A platform-authored piece always links to /about — the organization's
 * own real page, never a fabricated "author" page for a non-person.
 *
 * A teacher-authored piece only ever resolves to a link when `currentTeacher`
 * (whichever teacher profile this browser holds — there is at most one,
 * see local-teacher.ts) is genuinely the same teacher named in `author`
 * AND that profile is actually publicly viewable
 * (`canViewTeacherProfile`). Every other case — a different or unknown
 * teacherId (this browser doesn't hold the author's real profile), or a
 * private/blocked one — correctly resolves to no link at all: plain text,
 * never a broken, wrong, or unauthorized link. This is also why the
 * result can never be computed once and cached — a teacher can change
 * `visibility` at any time, and the link must disappear the moment they do.
 */
export function resolveAuthorProfileHref(
  author: ContentAuthor,
  currentTeacher: TeacherProfile | null,
): string | undefined {
  if (author.role === "platform") return "/about";

  if (currentTeacher && currentTeacher.id === author.teacherId && canViewTeacherProfile(currentTeacher)) {
    return `/teachers/p/${currentTeacher.slug}`;
  }

  return undefined;
}
