import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const sectionVariants = cva("py-16 sm:py-20 lg:py-24", {
  variants: {
    surface: {
      default: "bg-surface",
      sunken: "bg-surface-sunken",
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
