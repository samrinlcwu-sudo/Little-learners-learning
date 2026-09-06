import {
  BookOpen,
  Calculator,
  PenLine,
  Globe2,
  FlaskConical,
  Heart,
  Smile,
  Palette,
  BookMarked,
  Languages,
  BookOpenCheck,
  ClipboardList,
  Puzzle,
  Route,
  Paintbrush,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";
import type { AgeRange, ContentType } from "@/lib/content/types";

export interface LearningCategory {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** The platform's own target range for this category — a design decision, not a claim of external endorsement. */
  ageRange: AgeRange;
  /** Which content types this category is expected to eventually contain. */
  contentTypes: ContentType[];
}

export interface LearningCategoryGroup {
  group: string;
  categories: LearningCategory[];
}

/**
 * The platform's subject scope, as defined in the project brief — not a
 * catalog of existing content. Shared by the homepage teaser and the full
 * /learn pages so they never list different subjects. `slug` drives the
 * SEO-friendly /learn/[slug] route for each category.
 */
export const learningCategoryGroups: LearningCategoryGroup[] = [
  {
    group: "Core Subjects",
    categories: [
      {
        slug: "english-early-literacy",
        name: "English & Early Literacy",
        description: "Letters, phonics, and the building blocks of reading.",
        icon: BookOpen,
        ageRange: { minYears: 3, maxYears: 6 },
        contentTypes: ["lesson", "worksheet", "activity", "ebook"],
      },
      {
        slug: "mathematics",
        name: "Mathematics",
        description: "Numbers, counting, and early problem-solving.",
        icon: Calculator,
        ageRange: { minYears: 3, maxYears: 6 },
        contentTypes: ["lesson", "worksheet", "activity", "game"],
      },
      {
        slug: "early-writing",
        name: "Early Writing",
        description: "Pencil control, letter formation, and first words.",
        icon: PenLine,
        ageRange: { minYears: 4, maxYears: 7 },
        contentTypes: ["worksheet", "writing-practice"],
      },
      {
        slug: "world-around-us",
        name: "World Around Us",
        description: "Nature, seasons, and how the world works.",
        icon: Globe2,
        ageRange: { minYears: 3, maxYears: 7 },
        contentTypes: ["lesson", "ebook", "activity"],
      },
      {
        slug: "science-discovery",
        name: "Science & Discovery",
        description: "Curiosity-led exploration of how things work.",
        icon: FlaskConical,
        ageRange: { minYears: 4, maxYears: 7 },
        contentTypes: ["lesson", "activity", "ebook"],
      },
      {
        slug: "life-skills",
        name: "Life Skills",
        description: "Everyday routines, independence, and self-care.",
        icon: Heart,
        ageRange: { minYears: 2, maxYears: 6 },
        contentTypes: ["lesson", "activity"],
      },
      {
        slug: "social-emotional-learning",
        name: "Social & Emotional Learning",
        description: "Understanding feelings, sharing, and kindness.",
        icon: Smile,
        ageRange: { minYears: 2, maxYears: 6 },
        contentTypes: ["lesson", "activity", "ebook"],
      },
      {
        slug: "creativity",
        name: "Creativity",
        description: "Art, imagination, and creative expression.",
        icon: Palette,
        ageRange: { minYears: 2, maxYears: 7 },
        contentTypes: ["activity", "coloring"],
      },
    ],
  },
  {
    group: "Qur'an & Arabic",
    categories: [
      {
        slug: "quran-nazra",
        name: "Quran Learning — Nazra",
        description: "Foundational Qur'an reading practice.",
        icon: BookMarked,
        ageRange: { minYears: 4, maxYears: 8 },
        contentTypes: ["lesson"],
      },
      {
        slug: "arabic-letters",
        name: "Arabic Letters",
        description: "Recognizing and forming Arabic letters.",
        icon: Languages,
        ageRange: { minYears: 3, maxYears: 6 },
        contentTypes: ["lesson", "worksheet", "activity"],
      },
      {
        slug: "foundational-quran-reading",
        name: "Foundational Quran Reading",
        description: "Harakat, letter combinations, and early reading.",
        icon: BookOpenCheck,
        ageRange: { minYears: 5, maxYears: 8 },
        contentTypes: ["lesson"],
      },
    ],
  },
  {
    group: "Activities & Play",
    categories: [
      {
        slug: "educational-activities",
        name: "Educational Activities",
        description: "Hands-on exercises that reinforce learning.",
        icon: ClipboardList,
        ageRange: { minYears: 3, maxYears: 7 },
        contentTypes: ["activity"],
      },
      {
        slug: "puzzles",
        name: "Puzzles",
        description: "Logic and problem-solving through play.",
        icon: Puzzle,
        ageRange: { minYears: 3, maxYears: 7 },
        contentTypes: ["puzzle"],
      },
      {
        slug: "mazes",
        name: "Mazes",
        description: "Focus and fine-motor practice.",
        icon: Route,
        ageRange: { minYears: 4, maxYears: 7 },
        contentTypes: ["maze"],
      },
      {
        slug: "coloring",
        name: "Coloring",
        description: "Creative, screen-light activity time.",
        icon: Paintbrush,
        ageRange: { minYears: 2, maxYears: 7 },
        contentTypes: ["coloring"],
      },
      {
        slug: "learning-games",
        name: "Learning Games",
        description: "Play designed around real learning goals.",
        icon: Gamepad2,
        ageRange: { minYears: 3, maxYears: 7 },
        contentTypes: ["game"],
      },
    ],
  },
];

/** Flattened, for lookups that don't care about grouping. */
export function getAllLearningCategories(): LearningCategory[] {
  return learningCategoryGroups.flatMap((group) => group.categories);
}

export function getLearningCategoryBySlug(slug: string): LearningCategory | undefined {
  return getAllLearningCategories().find((category) => category.slug === slug);
}
