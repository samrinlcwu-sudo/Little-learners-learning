import {
  Sparkles,
  Puzzle,
  Users2,
  Brain,
  Gamepad2,
  GraduationCap,
  Heart,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { isActive } from "@/lib/taxonomy/types";

export interface BlogTopic {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  active?: boolean;
}

/**
 * The blog's own topic taxonomy — deliberately a *different* list from
 * `learningCategoryGroups` (src/config/learning-categories.ts), not a
 * renamed copy of it. A learning category answers "what subject does this
 * teach a child" (Mathematics, Arabic Letters); a blog topic answers "what
 * is this piece of adult-facing guidance about" (how to run circle time,
 * how to talk to a child about screen time). Where the brief's suggested
 * blog content areas are actually just the adult-facing angle on an
 * existing subject (Early Literacy, Early Mathematics, Life Skills, Social
 * & Emotional Learning, Science & Discovery, Educational Activities,
 * Qur'an/Nazra learning), an article links to that real learning-category
 * slug via `BlogArticle.category` instead of this list duplicating the
 * same name a second time under a different slug — see
 * docs/BLOG_ARCHITECTURE.md. Only the topics with no existing home in the
 * subject taxonomy get a slug here.
 */
export const blogTopics: BlogTopic[] = [
  {
    slug: "early-childhood-education",
    name: "Early Childhood Education",
    description: "The big picture: what early-years education is, and why it matters.",
    icon: Sparkles,
  },
  {
    slug: "preschool-activities",
    name: "Preschool Activities",
    description: "Hands-on ideas sized for preschool-age children.",
    icon: Puzzle,
  },
  {
    slug: "classroom-ideas",
    name: "Classroom Ideas",
    description: "Practical routines and setup ideas for an early-years classroom.",
    icon: Users2,
  },
  {
    slug: "child-development",
    name: "Child Development",
    description: "How young children grow, think, and learn.",
    icon: Brain,
  },
  {
    slug: "learning-through-play",
    name: "Learning Through Play",
    description: "Turning everyday play into real learning moments.",
    icon: Gamepad2,
  },
  {
    slug: "teacher-guidance",
    name: "Teacher Guidance",
    description: "Professional guidance for preschool and kindergarten teachers.",
    icon: GraduationCap,
  },
  {
    slug: "parent-guidance",
    name: "Parent Guidance",
    description: "Practical guidance for parents supporting learning at home.",
    icon: Heart,
  },
  {
    slug: "edtech-ai",
    name: "Educational Technology & AI",
    description: "Technology and AI in early-years education, considered carefully.",
    icon: Cpu,
  },
  {
    slug: "quran-nazra-guidance",
    name: "Qur'an & Nazra Learning Guidance",
    description: "Guidance for parents and teachers introducing Nazra reading — reviewed before publishing.",
    icon: Sparkles,
  },
];

export function getAllBlogTopics(): BlogTopic[] {
  return blogTopics.filter(isActive);
}

export function getBlogTopicBySlug(slug: string): BlogTopic | undefined {
  return getAllBlogTopics().find((topic) => topic.slug === slug);
}
