import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Strongest — the one primary action per view. */
        primary:
          "bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800",
        /** Alternate brand action, similar weight to primary — use for a second, unrelated action, never alongside primary as its equal. */
        secondary:
          "bg-secondary-600 text-white shadow-sm hover:bg-secondary-700 active:bg-secondary-800",
        /** Tinted, borderless — a mid-weight action that reads calmer than a solid fill. */
        soft: "bg-primary-50 text-primary-800 hover:bg-primary-100 active:bg-primary-200",
        /** Bordered, neutral — a secondary action alongside a primary button. */
        outline:
          "border border-neutral-300 bg-surface text-ink hover:bg-neutral-100",
        /** Lightest button — icon-only or low-emphasis toolbar actions. */
        ghost: "text-ink hover:bg-neutral-100",
        /** Text-only action, no button chrome — "skip", "learn more", inline links. */
        link: "text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline",
        destructive: "bg-error-700 text-white hover:bg-error-800",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-13 px-7 text-base",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        size: ["sm", "md", "lg"],
        className: "h-auto px-0 py-0 font-medium",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild, isLoading, disabled, children, ...props },
    ref,
  ) => {
    // `asChild` delegates to a single arbitrary child (e.g. a Link) — Radix
    // Slot requires exactly one element child, so the loading icon (which
    // doesn't apply to that case anyway) is only ever added for a real <button>.
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
