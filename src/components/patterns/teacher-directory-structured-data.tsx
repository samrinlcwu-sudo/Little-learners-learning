import { siteConfig } from "@/config/site";
import type { PublicTeacherProfile } from "@/lib/accounts/teacher-public-profile";

/**
 * An `ItemList` naming the teachers actually shown on this page — nothing
 * else. When the directory is empty (true for every visitor today, since
 * no profile can be "approved" without a reviewer — see
 * docs/TEACHER_DIRECTORY_ARCHITECTURE.md), this renders nothing at all:
 * emitting a schema.org list with zero items, or describing profiles a
 * crawler can't actually see rendered on the page, is exactly the
 * "search-engine content not visible to users" Prompt 26's SEO rule
 * already forbids. Once real approved teachers exist, this starts
 * describing exactly the current page of results — not the whole
 * directory — matching how pagination already works.
 */
function TeacherDirectoryStructuredData({ teachers }: { teachers: PublicTeacherProfile[] }) {
  if (teachers.length === 0) return null;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: teachers.map((teacher, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.url}/teachers/p/${teacher.slug}`,
      name: teacher.name,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />;
}

export { TeacherDirectoryStructuredData };
