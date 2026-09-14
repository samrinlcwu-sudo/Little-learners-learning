"use client";

import { useTeacherProfile } from "./use-teacher-profile";
import { resolveAuthorProfileHref } from "./author-profile-link";
import type { ContentAuthor } from "@/lib/content/types";

/** Reactive wrapper around resolveAuthorProfileHref — re-resolves whenever this browser's local teacher record changes (e.g. the teacher flips their own visibility). */
export function useAuthorProfileHref(author: ContentAuthor): string | undefined {
  const { teacher } = useTeacherProfile();
  return resolveAuthorProfileHref(author, teacher);
}
