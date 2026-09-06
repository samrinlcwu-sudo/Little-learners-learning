import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDetailsElement> {
  question: string;
  children: React.ReactNode;
}

/**
 * Built on native <details>/<summary> — keyboard support, screen-reader
 * expanded/collapsed state, and no-JS behavior all come from the browser
 * for free, so this needs no client-side script and no new dependency.
 */
function AccordionItem({ question, children, className, ...props }: AccordionItemProps) {
  return (
    <details
      className={cn(
        "group rounded-xl border border-neutral-200 bg-surface open:border-primary-200",
        className,
      )}
      {...props}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown
          className="size-4 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <div className="px-5 pb-5 text-sm text-neutral-600">{children}</div>
    </details>
  );
}

function Accordion({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

export { Accordion, AccordionItem };
