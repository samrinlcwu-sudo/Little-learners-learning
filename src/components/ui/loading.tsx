import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

/** Use for indeterminate, in-progress actions (submitting a form, loading a page). */
function Spinner({ className, label = "Loading…", ...props }: SpinnerProps) {
  return (
    <div role="status" className={cn("inline-flex items-center gap-2", className)} {...props}>
      <Loader2 className="size-5 animate-spin text-primary-600" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Use to reserve layout space for content that's about to arrive, avoiding content jump. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Spinner, Skeleton };
