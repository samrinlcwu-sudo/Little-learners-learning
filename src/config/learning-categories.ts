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

export interface LearningCategory {
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface LearningCategoryGroup {
  group: string;
  categories: LearningCategory[];
}

/**
 * The platform's subject scope, as defined in the project brief — not a
 * catalog of existing content. Shared by the homepage teaser and (later)
 * the full /learn page so the two never list different subjects.
 */
export const learningCategoryGroups: LearningCategoryGroup[] = [
  {
    group: "Core Subjects",
    categories: [
      { name: "English & Early Literacy", description: "Letters, phonics, and the building blocks of reading.", icon: BookOpen },
      { name: "Mathematics", description: "Numbers, counting, and early problem-solving.", icon: Calculator },
      { name: "Early Writing", description: "Pencil control, letter formation, and first words.", icon: PenLine },
      { name: "World Around Us", description: "Nature, seasons, and how the world works.", icon: Globe2 },
      { name: "Science & Discovery", description: "Curiosity-led exploration of how things work.", icon: FlaskConical },
      { name: "Life Skills", description: "Everyday routines, independence, and self-care.", icon: Heart },
      { name: "Social & Emotional Learning", description: "Understanding feelings, sharing, and kindness.", icon: Smile },
      { name: "Creativity", description: "Art, imagination, and creative expression.", icon: Palette },
    ],
  },
  {
    group: "Qur'an & Arabic",
    categories: [
      { name: "Quran Learning — Nazra", description: "Foundational Qur'an reading practice.", icon: BookMarked },
      { name: "Arabic Letters", description: "Recognizing and forming Arabic letters.", icon: Languages },
      { name: "Foundational Quran Reading", description: "Harakat, letter combinations, and early reading.", icon: BookOpenCheck },
    ],
  },
  {
    group: "Activities & Play",
    categories: [
      { name: "Educational Activities", description: "Hands-on exercises that reinforce learning.", icon: ClipboardList },
      { name: "Puzzles", description: "Logic and problem-solving through play.", icon: Puzzle },
      { name: "Mazes", description: "Focus and fine-motor practice.", icon: Route },
      { name: "Coloring", description: "Creative, screen-light activity time.", icon: Paintbrush },
      { name: "Learning Games", description: "Play designed around real learning goals.", icon: Gamepad2 },
    ],
  },
];
