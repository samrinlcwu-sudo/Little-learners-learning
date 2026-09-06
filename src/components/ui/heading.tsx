import * as React from "react";
import { cn } from "@/lib/utils/cn";

type HeadingLevel = "display" | "h1" | "h2" | "h3" | "h4" | "h5";

const styles: Record<HeadingLevel, string> = {
  display:
    "font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl",
  h1: "font-display text-3xl font-semibold tracking-tight sm:text-4xl",
  h2: "font-display text-2xl font-semibold tracking-tight sm:text-3xl",
  h3: "font-display text-xl font-semibold sm:text-2xl",
  h4: "font-sans text-lg font-semibold",
  h5: "font-sans text-base font-semibold",
};

const defaultElement: Record<HeadingLevel, React.ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
};

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  /** Override the rendered element when visual size and document outline diverge. */
  as?: React.ElementType;
}

/**
 * Visual heading scale decoupled from semantic level: pick `level` for how it
 * should look, `as` only when the correct outline level differs from that.
 */
function Heading({ level, as, className, ...props }: HeadingProps) {
  const Component = as ?? defaultElement[level];
  return <Component className={cn(styles[level], "text-ink", className)} {...props} />;
}

export { Heading };
