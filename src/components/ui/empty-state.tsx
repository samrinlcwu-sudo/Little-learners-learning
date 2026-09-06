import * as React from "react";
import { Inbox, AlertCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "empty" | "error";
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const defaultIcons = { empty: Inbox, error: AlertCircle } as const;

/**
 * One shape for "nothing here yet" and "something went wrong" —  the copy and
 * icon differ, the layout doesn't, so features don't invent their own each time.
 */
function EmptyState({
  variant = "empty",
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const Icon = icon ?? defaultIcons[variant];
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 px-6 py-16 text-center",
        className,
      )}
      {...props}
    >
      <Icon
        className={cn(
          "size-10",
          variant === "error" ? "text-error-600" : "text-neutral-400",
        )}
        aria-hidden="true"
      />
      <div className="space-y-1">
        <p className="font-display text-lg font-semibold text-ink">{title}</p>
        {description && <p className="max-w-sm text-sm text-neutral-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export { EmptyState };
