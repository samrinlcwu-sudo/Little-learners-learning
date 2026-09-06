import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds hover elevation + border tint — for cards that are or contain a link/action, never for static display cards. */
  interactive?: boolean;
}

function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-surface shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out motion-reduce:transition-none",
        interactive &&
          "hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md motion-reduce:hover:translate-y-0",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  );
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    // eslint-disable-next-line jsx-a11y/heading-has-content -- content arrives via ...props (children) at every call site
    <h3
      className={cn("font-display text-lg font-semibold text-ink", className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-neutral-600", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
