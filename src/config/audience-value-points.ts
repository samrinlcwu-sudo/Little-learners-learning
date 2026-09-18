import { Layers, Baby, ShieldCheck, UserCircle, GraduationCap, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CategoryTone } from "@/lib/utils/category-tone";

export interface AudienceValuePoint {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Each point gets its own color (Prompt 95) instead of every card in a section sharing one tone — the same coordinated-but-distinct treatment already used for subject/resource/game cards. */
  tone: CategoryTone;
}

/**
 * Single source of truth for the "For Parents" / "For Teachers" value
 * points — shown on the homepage teaser AND the dedicated /parents and
 * /teachers pages, so the two never drift apart or repeat different copy.
 */
export const parentValuePoints: AudienceValuePoint[] = [
  {
    icon: Layers,
    title: "Organized by subject",
    description: "Learning is grouped clearly by subject, so it's easy to find what fits your child right now.",
    tone: "blue",
  },
  {
    icon: Baby,
    title: "Built for early years",
    description: "Designed specifically around how young children learn — not adapted from older-kids content.",
    tone: "green",
  },
  {
    icon: ShieldCheck,
    title: "Careful with Qur'an content",
    description: "Religious content is reviewed by a qualified person before publishing — never generated automatically.",
    tone: "secondary",
  },
];

export const teacherValuePoints: AudienceValuePoint[] = [
  {
    icon: UserCircle,
    title: "Professional profiles",
    description: "A profile for your experience, subjects, age groups, and areas of expertise.",
    tone: "purple",
  },
  {
    icon: GraduationCap,
    title: "Share your expertise",
    description: "Contribute resources and be discoverable by families looking for your specialties.",
    tone: "coral",
  },
  {
    icon: Sparkles,
    title: "Room to grow",
    description: "Professional development opportunities are planned as the platform develops.",
    tone: "accent",
  },
];
