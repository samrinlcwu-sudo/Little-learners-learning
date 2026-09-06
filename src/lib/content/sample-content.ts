import type { LearningContent } from "./types";

/**
 * A handful of clearly-marked SAMPLE records — not a real content library.
 * They exist only to prove the content model, cards, and filter UI work
 * end to end. Every place that renders these must show a "Sample" badge
 * (see `LearningCard`'s `isSample` prop); do not treat this file as a
 * pattern for bulk-generating content.
 *
 * Deliberately none are in a Qur'an/Arabic category — those stay empty
 * until real, human-reviewed content exists (see RELIGIOUS_REVIEW_REQUIRED
 * _CATEGORIES in ./types.ts).
 */
export const SAMPLE_CONTENT: LearningContent[] = [
  {
    id: "sample-1",
    slug: "counting-to-ten-practice-sheet",
    title: "Counting to Ten — Practice Sheet",
    description: "A printable sheet for practicing counting objects from one to ten.",
    category: "mathematics",
    ageRange: { minYears: 3, maxYears: 5 },
    learningObjective: "Count a small group of objects accurately.",
    difficulty: "beginner",
    contentType: "worksheet",
    tags: ["counting", "numbers"],
    author: { name: "Little Learners Learning", role: "platform" },
    publicationStatus: "published",
    religiousReview: "not-applicable",
    featured: true,
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
  {
    id: "sample-2",
    slug: "letter-sounds-a-to-e",
    title: "Letter Sounds: A to E",
    description: "An introductory lesson on the sounds made by the first five letters of the alphabet.",
    category: "english-early-literacy",
    ageRange: { minYears: 3, maxYears: 5 },
    learningObjective: "Match each letter A–E to its sound.",
    difficulty: "beginner",
    contentType: "lesson",
    tags: ["phonics", "alphabet"],
    author: { name: "Little Learners Learning", role: "platform" },
    publicationStatus: "published",
    religiousReview: "not-applicable",
    featured: true,
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
  {
    id: "sample-3",
    slug: "getting-dressed-independently",
    title: "Getting Dressed Independently",
    description: "A step-by-step activity that walks through getting dressed without help.",
    category: "life-skills",
    ageRange: { minYears: 2, maxYears: 4 },
    learningObjective: "Follow a short sequence of steps to get dressed.",
    difficulty: "beginner",
    contentType: "activity",
    tags: ["independence", "routines"],
    author: { name: "Little Learners Learning", role: "platform" },
    publicationStatus: "published",
    religiousReview: "not-applicable",
    featured: false,
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "sample-4",
    slug: "shape-matching-puzzle",
    title: "Shape Matching Puzzle",
    description: "A simple matching puzzle pairing everyday objects with their basic shape.",
    category: "puzzles",
    ageRange: { minYears: 3, maxYears: 5 },
    learningObjective: "Match everyday objects to their basic shape.",
    difficulty: "beginner",
    contentType: "puzzle",
    tags: ["shapes", "matching"],
    author: { name: "Little Learners Learning", role: "platform" },
    publicationStatus: "published",
    religiousReview: "not-applicable",
    featured: false,
    createdAt: "2026-01-22",
    updatedAt: "2026-01-22",
  },
];
