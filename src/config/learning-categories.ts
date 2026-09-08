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
import { isActive } from "@/lib/taxonomy/types";

export interface LearningCategory {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** The platform's own target range for this category — a design decision, not a claim of external endorsement. */
  ageRange: AgeRange;
  /** Which content types this category is expected to eventually contain. */
  contentTypes: ContentType[];
  /** The platform's own stated goals for the category — short, plain, non-promotional. */
  learningObjectives: string[];
  /**
   * Omitted (or true) means active. No admin UI sets this yet, but
   * `getAllLearningCategories()` already filters through it — see
   * docs/TAXONOMY_ARCHITECTURE.md for the same convention used by every
   * other selectable list in this codebase (src/lib/taxonomy/types.ts).
   */
  active?: boolean;
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
        learningObjectives: ["Recognize letters and their sounds", "Build early reading confidence"],
      },
      {
        slug: "mathematics",
        name: "Mathematics",
        description: "Numbers, counting, and early problem-solving.",
        icon: Calculator,
        ageRange: { minYears: 3, maxYears: 6 },
        contentTypes: ["lesson", "worksheet", "activity", "game"],
        learningObjectives: ["Understand numbers and counting", "Recognize shapes and simple patterns"],
      },
      {
        slug: "early-writing",
        name: "Early Writing",
        description: "Pencil control, letter formation, and first words.",
        icon: PenLine,
        ageRange: { minYears: 4, maxYears: 7 },
        contentTypes: ["worksheet", "writing-practice"],
        learningObjectives: ["Develop pencil grip and control", "Form letters correctly"],
      },
      {
        slug: "world-around-us",
        name: "World Around Us",
        description: "Nature, seasons, and how the world works.",
        icon: Globe2,
        ageRange: { minYears: 3, maxYears: 7 },
        contentTypes: ["lesson", "ebook", "activity"],
        learningObjectives: ["Explore nature and everyday environments", "Understand seasons and time"],
      },
      {
        slug: "science-discovery",
        name: "Science & Discovery",
        description: "Curiosity-led exploration of how things work.",
        icon: FlaskConical,
        ageRange: { minYears: 4, maxYears: 7 },
        contentTypes: ["lesson", "activity", "ebook"],
        learningObjectives: ["Ask questions and observe closely", "Explore simple cause and effect"],
      },
      {
        slug: "life-skills",
        name: "Life Skills",
        description: "Everyday routines, independence, and self-care.",
        icon: Heart,
        ageRange: { minYears: 2, maxYears: 6 },
        contentTypes: ["lesson", "activity"],
        learningObjectives: ["Build everyday independence", "Practice self-care routines"],
      },
      {
        slug: "social-emotional-learning",
        name: "Social & Emotional Learning",
        description: "Understanding feelings, sharing, and kindness.",
        icon: Smile,
        ageRange: { minYears: 2, maxYears: 6 },
        contentTypes: ["lesson", "activity", "ebook"],
        learningObjectives: ["Name and understand feelings", "Practice sharing and kindness"],
      },
      {
        slug: "creativity",
        name: "Creativity",
        description: "Art, imagination, and creative expression.",
        icon: Palette,
        ageRange: { minYears: 2, maxYears: 7 },
        contentTypes: ["activity", "coloring"],
        learningObjectives: ["Express ideas through art", "Build confidence through imaginative play"],
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
        learningObjectives: ["Introduce foundational Qur'an reading practice", "Build familiarity at a comfortable pace"],
      },
      {
        slug: "arabic-letters",
        name: "Arabic Letters",
        description: "Recognizing and forming Arabic letters.",
        icon: Languages,
        ageRange: { minYears: 3, maxYears: 6 },
        contentTypes: ["lesson", "worksheet", "activity"],
        learningObjectives: ["Recognize the Arabic alphabet", "Practice letter formation"],
      },
      {
        slug: "foundational-quran-reading",
        name: "Foundational Quran Reading",
        description: "Harakat, letter combinations, and early reading.",
        icon: BookOpenCheck,
        ageRange: { minYears: 5, maxYears: 8 },
        contentTypes: ["lesson"],
        learningObjectives: ["Learn harakat and short vowels", "Practice basic letter combinations"],
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
        learningObjectives: ["Reinforce learning through hands-on tasks", "Build focus and follow-through"],
      },
      {
        slug: "puzzles",
        name: "Puzzles",
        description: "Logic and problem-solving through play.",
        icon: Puzzle,
        ageRange: { minYears: 3, maxYears: 7 },
        contentTypes: ["puzzle"],
        learningObjectives: ["Develop problem-solving skills", "Build patience and persistence"],
      },
      {
        slug: "mazes",
        name: "Mazes",
        description: "Focus and fine-motor practice.",
        icon: Route,
        ageRange: { minYears: 4, maxYears: 7 },
        contentTypes: ["maze"],
        learningObjectives: ["Practice visual tracking and focus", "Build fine-motor coordination"],
      },
      {
        slug: "coloring",
        name: "Coloring",
        description: "Creative, screen-light activity time.",
        icon: Paintbrush,
        ageRange: { minYears: 2, maxYears: 7 },
        contentTypes: ["coloring"],
        learningObjectives: ["Practice color recognition", "Build fine-motor control"],
      },
      {
        slug: "learning-games",
        name: "Learning Games",
        description: "Play designed around real learning goals.",
        icon: Gamepad2,
        ageRange: { minYears: 3, maxYears: 7 },
        contentTypes: ["game"],
        learningObjectives: ["Reinforce subject learning through play", "Build engagement and motivation"],
      },
    ],
  },
];

/** Flattened, for lookups that don't care about grouping. Excludes any category an admin has deactivated (`active: false`). */
export function getAllLearningCategories(): LearningCategory[] {
  return learningCategoryGroups.flatMap((group) => group.categories).filter(isActive);
}

export function getLearningCategoryBySlug(slug: string): LearningCategory | undefined {
  return getAllLearningCategories().find((category) => category.slug === slug);
}

/** Other categories from the same group — for a "Related categories" section. */
export function getRelatedCategories(slug: string, limit = 3): LearningCategory[] {
  const group = learningCategoryGroups.find((g) => g.categories.some((c) => c.slug === slug));
  if (!group) return [];
  return group.categories.filter((c) => c.slug !== slug).slice(0, limit);
}
