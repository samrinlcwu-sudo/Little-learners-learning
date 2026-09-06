import { Layers, Baby, ShieldCheck, UserCircle, GraduationCap, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AudienceValuePoint {
  icon: LucideIcon;
  title: string;
  description: string;
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
  },
  {
    icon: Baby,
    title: "Built for early years",
    description: "Designed specifically around how young children learn — not adapted from older-kids content.",
  },
  {
    icon: ShieldCheck,
    title: "Careful with Qur'an content",
    description: "Religious content is reviewed by a qualified person before publishing — never generated automatically.",
  },
];

export const teacherValuePoints: AudienceValuePoint[] = [
  {
    icon: UserCircle,
    title: "Professional profiles",
    description: "A profile for your experience, subjects, age groups, and areas of expertise.",
  },
  {
    icon: GraduationCap,
    title: "Share your expertise",
    description: "Contribute resources and be discoverable by families looking for your specialties.",
  },
  {
    icon: Sparkles,
    title: "Room to grow",
    description: "Professional development opportunities are planned as the platform develops.",
  },
];
