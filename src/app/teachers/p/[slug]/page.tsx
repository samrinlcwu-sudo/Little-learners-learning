import type { Metadata } from "next";
import { TeacherPublicProfilePage } from "@/components/patterns/teacher-public-profile-page";

/**
 * Always noindex, always this generic description — not a placeholder
 * that should later "just" be swapped for real per-teacher metadata.
 * `generateMetadata` runs server-side and has no way to know a specific
 * browser's localStorage, so it genuinely cannot tell whether the profile
 * behind a given slug is public, private, or exists at all. Once a real
 * backend exists, this becomes a real generateMetadata(params) that reads
 * the row and sets a unique title/description and `robots: { index: true }`
 * only when `visibility === "public"` — see docs/TEACHER_ARCHITECTURE.md,
 * "SEO for the public profile."
 */
export const metadata: Metadata = {
  title: "Teacher Profile",
  description: "A Little Learners Learning teacher's public profile.",
  robots: { index: false, follow: false },
};

export default function TeacherPublicProfileRoute() {
  return <TeacherPublicProfilePage />;
}
