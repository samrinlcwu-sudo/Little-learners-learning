import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex min-h-28 w-full rounded-md border border-neutral-300 bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-neutral-500 transition-colors",
          "hover:border-neutral-400",
          "focus-visible:border-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid &&
            "border-error-600 focus-visible:border-error-600 focus-visible:ring-error-600/30",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
