import type { AiAudience } from "./types";

/**
 * Which real screen someone is on decides who the assistant thinks it's
 * talking to — derived from the URL, never guessed or self-declared, the
 * same "derive, don't invent" rule every other honesty-sensitive part of
 * this app follows. A pure function so it's directly testable
 * (audience.test.ts) without rendering anything.
 *
 * Order matters: the child route is checked before the broader `/dashboard`
 * prefix it lives under, and the teacher routes before falling through to
 * "public" (which also covers the teacher directory and public profile
 * pages at `/teachers` and `/teachers/p/[slug]` — genuinely public surfaces,
 * not the teacher's own private area).
 */
export function getAiAudience(pathname: string): AiAudience {
  if (pathname.startsWith("/dashboard/children/")) return "child";
  if (pathname.startsWith("/teachers/dashboard") || pathname.startsWith("/teachers/register")) return "teacher";
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/account")) return "parent";
  return "public";
}
