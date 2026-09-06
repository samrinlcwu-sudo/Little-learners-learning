import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const eyebrowVariants = cva("text-eyebrow block", {
  variants: {
    tone: {
      primary: "text-primary-700",
      secondary: "text-secondary-600",
      accent: "text-accent-600",
      neutral: "text-neutral-500",
      inverse: "text-white/80",
    },
  },
  defaultVariants: {
    tone: "primary",
  },
});

export interface EyebrowProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof eyebrowVariants> {}

/** Small label above a heading — names the section before the heading makes its point. Used once per section, never as a substitute for a real heading. */
function Eyebrow({ className, tone, ...props }: EyebrowProps) {
  return <p className={cn(eyebrowVariants({ tone }), className)} {...props} />;
}

export { Eyebrow, eyebrowVariants };
