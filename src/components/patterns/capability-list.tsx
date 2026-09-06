import { Check, Clock } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface CapabilityItem {
  title: string;
  description: string;
}

export interface CapabilityListProps {
  title: string;
  status: "available" | "coming";
  items: CapabilityItem[];
  className?: string;
}

const STATUS_CONFIG = {
  available: {
    badgeLabel: "Available now",
    badgeVariant: "success" as const,
    icon: Check,
    iconClass: "text-success-600",
  },
  coming: {
    badgeLabel: "Coming later",
    badgeVariant: "neutral" as const,
    icon: Clock,
    iconClass: "text-neutral-400",
  },
};

/**
 * The "what you can do here today vs. what's still planned" list used on
 * the Parents and Teachers pages — a shared shape so the two never present
 * this honesty distinction differently.
 */
function CapabilityList({ title, status, items, className }: CapabilityListProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <Heading level="h4" as="h3">
          {title}
        </Heading>
        <Badge variant={config.badgeVariant}>{config.badgeLabel}</Badge>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.title} className="flex gap-3">
            <Icon className={cn("mt-0.5 size-4 shrink-0", config.iconClass)} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <p className="mt-0.5 text-sm text-neutral-600">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { CapabilityList };
