import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

/**
 * Native <select> under the hood — full keyboard/screen-reader support for
 * free, no custom listbox to maintain. A styled combobox can replace this
 * later if a feature genuinely needs richer option rendering.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex h-11 w-full appearance-none rounded-md border border-neutral-300 bg-surface pl-3.5 pr-10 text-sm text-ink transition-colors",
            "hover:border-neutral-400",
            "focus-visible:border-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid &&
              "border-error-600 focus-visible:border-error-600 focus-visible:ring-error-600/30",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
          aria-hidden="true"
        />
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
