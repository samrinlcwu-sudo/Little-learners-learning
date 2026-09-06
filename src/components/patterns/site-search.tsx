"use client";

import * as React from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search as SearchIcon, X } from "lucide-react";
import { searchSite, type SearchEntry } from "@/lib/search";

const GROUP_ORDER = ["Pages", "Subjects", "Games", "Resources", "Learning Hub"];

function groupResults(results: SearchEntry[]) {
  const byGroup = new Map<string, SearchEntry[]>();
  for (const entry of results) {
    if (!byGroup.has(entry.group)) byGroup.set(entry.group, []);
    byGroup.get(entry.group)!.push(entry);
  }
  return GROUP_ORDER.filter((group) => byGroup.has(group)).map((group) => ({
    group,
    items: byGroup.get(group)!,
  }));
}

export interface SiteSearchProps {
  children: React.ReactNode;
}

/**
 * A real, working search — not a "coming soon" placeholder. It's a plain
 * substring match over subjects, resources, and games (see
 * src/lib/search/index.ts), wrapped in an accessible dialog. Any number of
 * trigger elements can live inside as children (the desktop icon button and
 * the mobile drawer's search row both open the same instance).
 */
function SiteSearch({ children }: SiteSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const grouped = React.useMemo(() => groupResults(searchSite(query)), [query]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      {children}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          className="fixed left-1/2 top-24 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-neutral-200 bg-surface shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out"
        >
          <DialogPrimitive.Title className="sr-only">Search Little Learners Learning</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search subjects, resources, and games across the site.
          </DialogPrimitive.Description>

          <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
            <SearchIcon className="size-5 shrink-0 text-neutral-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search subjects, resources, games…"
              className="h-9 w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
            />
            <DialogPrimitive.Close className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Close search</span>
            </DialogPrimitive.Close>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.trim() === "" ? (
              <p className="px-3 py-8 text-center text-sm text-neutral-500">
                Start typing to search subjects, resources, and games.
              </p>
            ) : grouped.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium text-ink">No results for &quot;{query}&quot;</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Try a different word, or browse{" "}
                  <Link
                    href="/learn"
                    onClick={() => handleOpenChange(false)}
                    className="text-primary-700 underline-offset-4 hover:underline"
                  >
                    Learning
                  </Link>
                  ,{" "}
                  <Link
                    href="/resources"
                    onClick={() => handleOpenChange(false)}
                    className="text-primary-700 underline-offset-4 hover:underline"
                  >
                    Resources
                  </Link>{" "}
                  or{" "}
                  <Link
                    href="/games"
                    onClick={() => handleOpenChange(false)}
                    className="text-primary-700 underline-offset-4 hover:underline"
                  >
                    Games
                  </Link>
                  .
                </p>
              </div>
            ) : (
              grouped.map(({ group, items }) => (
                <div key={group} className="mb-2 last:mb-0">
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    {group}
                  </p>
                  {items.map((item) => (
                    <Link
                      key={`${item.group}-${item.href}-${item.title}`}
                      href={item.href}
                      onClick={() => handleOpenChange(false)}
                      className="block rounded-lg px-3 py-2 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
                    >
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                      <p className="truncate text-xs text-neutral-500">{item.description}</p>
                    </Link>
                  ))}
                </div>
              ))
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

const SiteSearchTrigger = DialogPrimitive.Trigger;

export { SiteSearch, SiteSearchTrigger };
