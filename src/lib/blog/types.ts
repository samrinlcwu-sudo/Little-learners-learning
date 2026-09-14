import type { AgeRange, ContentAuthor, PublicationStatus, ReligiousReviewStatus } from "@/lib/content/types";

/**
 * Mirrors the site's existing "For Parents" / "For Teachers" split
 * (src/config/nav.ts) rather than inventing a third audience taxonomy — an
 * article aimed at "preschool teachers, kindergarten teachers, early
 * childhood educators, and education professionals" (the brief's list) is
 * simply this site's existing "teachers" audience; there is no separate
 * concept anywhere else in this codebase for those to map onto.
 */
export type BlogAudience = "parents" | "teachers";

export const BLOG_AUDIENCE_LABELS: Record<BlogAudience, string> = {
  parents: "Parents",
  teachers: "Teachers & Educators",
};

/** One heading + its paragraphs — the whole body is just an ordered list of these, kept intentionally plain (no rich-text/markdown engine exists anywhere in this codebase). */
export interface BlogSection {
  heading: string;
  paragraphs: string[];
}

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogArticle {
  id: string;
  /** URL-safe, unique across the whole blog — drives /blog/[slug]. */
  slug: string;
  title: string;
  /** The one-paragraph summary — shown on cards, and the fallback meta description. */
  excerpt: string;
  /**
   * A slug from src/config/blog-topics.ts — the audience/topic-facing
   * classification every article needs (an article "for parents" doesn't
   * teach a subject the way a Resource does). Required, unlike `category`
   * below.
   */
  topic: string;
  /**
   * A learning-category slug (src/config/learning-categories.ts), when
   * this article's subject matter lines up with one of the 16 subjects —
   * e.g. an Early Mathematics article cross-linking to the "mathematics"
   * category and its real resources. Optional and independent of `topic`,
   * the same reason `Resource.category` is optional alongside its required
   * `resourceType` (src/lib/resources/types.ts).
   */
  category?: string;
  tags: string[];
  audience: BlogAudience[];
  /** Omitted for general-audience guidance that isn't tied to a specific child age (e.g. a classroom-management or ed-tech piece). */
  ageRange?: AgeRange;
  sections: BlogSection[];
  /** Concrete, doable examples — required to be genuinely practical, not just descriptive. */
  practicalExamples?: string[];
  /** Real Resource slugs (src/lib/resources/sample-resources.ts) this article naturally connects to — never invented, only ever an existing resource's real slug. */
  relatedResourceSlugs?: string[];
  faq?: BlogFaqItem[];
  thumbnail?: string;
  author: ContentAuthor;
  featured: boolean;
  publicationStatus: PublicationStatus;
  religiousReview: ReligiousReviewStatus;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** Topic slugs whose articles must pass religious review before publishing — mirrors RELIGIOUS_REVIEW_REQUIRED_CATEGORIES (src/lib/content/types.ts) for the same reason: guidance about Qur'an/Nazra learning needs a qualified human check, even when it's guidance for adults rather than content for children. */
export const BLOG_RELIGIOUS_REVIEW_REQUIRED_TOPICS = ["quran-nazra-guidance"] as const;

/** Same gate shape as isResourcePublished/isGamePublished/isPubliclyVisible: draft (and "review"/"archived") never shows, and a Qur'an/Nazra-guidance article additionally requires human verification. */
export function isArticlePublished(article: BlogArticle): boolean {
  if (article.publicationStatus !== "published") return false;

  const requiresReligiousReview = (
    BLOG_RELIGIOUS_REVIEW_REQUIRED_TOPICS as readonly string[]
  ).includes(article.topic);

  if (requiresReligiousReview && article.religiousReview !== "verified") {
    return false;
  }

  return true;
}
