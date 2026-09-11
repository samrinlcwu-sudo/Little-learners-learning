import { isResourcePublished, type Resource } from "@/lib/resources/types";
import type { KnowledgeItemRef } from "./types";

/**
 * A teacher's own resources — the "Teacher-specific information" the
 * Prompt 47 brief asks the knowledge layer to distinguish from public
 * content. Deliberately takes `resources` as a parameter rather than
 * reading a store itself: the caller (a teacher's own dashboard context)
 * already scopes resources to the one teacher a browser can ever hold
 * (src/lib/accounts/local-teacher.ts), so this function can't be called
 * with anyone else's data by construction. It never filters by
 * `isResourcePublished()` — a teacher can see their own drafts and
 * pending submissions, which a public knowledge query never would (see
 * public-knowledge.ts). `visibleToPublic` on each item tells a caller
 * whether that same resource shows up anywhere outside this teacher's own
 * view yet.
 */
export interface TeacherResourceKnowledge extends KnowledgeItemRef {
  publicationStatus: Resource["publicationStatus"];
  reviewStatus: Resource["reviewStatus"];
  visibleToPublic: boolean;
}

export function getTeacherResourceKnowledge(teacherId: string, resources: Resource[]): TeacherResourceKnowledge[] {
  return resources
    .filter((resource) => resource.author.teacherId === teacherId)
    .map((resource) => ({
      id: resource.id,
      slug: resource.slug,
      title: resource.title,
      href: `/resources/${resource.slug}`,
      ageRange: resource.ageRange,
      difficulty: resource.difficulty,
      publicationStatus: resource.publicationStatus,
      reviewStatus: resource.reviewStatus,
      visibleToPublic: isResourcePublished(resource),
    }));
}
