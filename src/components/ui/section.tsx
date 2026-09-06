import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const sectionVariants = cva("py-16 sm:py-20 lg:py-24", {
  variants: {
    surface: {
      /** Clean reading surface — content grids, cards, detail pages. */
      default: "bg-surface",
      /** Warm cream — the default page background; use for hero and reflective moments. */
      sunken: "bg-surface-sunken",
      /** Soft teal tint — calm, trustworthy sections (e.g. for parents). */
      "tint-primary": "bg-surface-tint-primary",
      /** Soft terracotta tint — warm contrast to the primary tint. */
      "tint-secondary": "bg-surface-tint-secondary",
      /** Soft golden tint — a touch more playful, still restrained (e.g. games). */
      "tint-accent": "bg-surface-tint-accent",
      /** Strong brand treatment — reserve for a single CTA moment per page. */
      primary: "bg-primary-900 text-white",
    },
  },
  defaultVariants: {
    surface: "default",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

/** Consistent vertical rhythm between page sections — the unit every page is built from. */
function Section({ className, surface, ...props }: SectionProps) {
  return (
    <section className={cn(sectionVariants({ surface }), className)} {...props} />
  );
}

export { Section, sectionVariants };
