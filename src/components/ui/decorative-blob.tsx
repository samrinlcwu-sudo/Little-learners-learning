import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface DecorativeBlobProps extends React.SVGAttributes<SVGSVGElement> {
  tone?: "primary" | "secondary" | "accent";
}

const tones = {
  primary: "text-primary-200",
  secondary: "text-secondary-200",
  accent: "text-accent-200",
} as const;

/**
 * A single soft, abstract shape — a restrained stand-in for illustration.
 * Deliberately not a character/mascot: adds warmth without pulling the UI
 * toward a "clip-art kindergarten" look. Use sparingly, low opacity, behind content.
 */
function DecorativeBlob({ tone = "primary", className, ...props }: DecorativeBlobProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={cn(tones[tone], className)}
      {...props}
    >
      <path
        fill="currentColor"
        d="M45.3,-58.5C58.6,-49.6,69.2,-35.4,73.6,-19.5C78,-3.6,76.2,14,68.6,28.5C61,43,47.6,54.4,32.4,61.6C17.2,68.8,0.2,71.8,-16.4,69.1C-33,66.4,-49.2,58,-59.7,44.7C-70.2,31.4,-75,13.2,-73.4,-4.2C-71.8,-21.6,-63.8,-38.2,-51.2,-47.3C-38.6,-56.4,-21.4,-58,-4.1,-56.2C13.2,-54.4,32.1,-67.4,45.3,-58.5Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

export { DecorativeBlob };
