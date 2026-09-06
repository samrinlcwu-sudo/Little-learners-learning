"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LearningCard } from "@/components/patterns/learning-card";
import { filterContent, type ContentFilters } from "@/lib/content/filters";
import { CONTENT_TYPE_LABELS, type ContentType, type LearningContent } from "@/lib/content/types";
import { getAllLearningCategories } from "@/config/learning-categories";

export interface LearningContentBrowserProps {
  items: LearningContent[];
  /** Show the category dropdown — off when the page itself already scopes to one category. */
  showCategoryFilter?: boolean;
}

const categoryNameBySlug = new Map(
  getAllLearningCategories().map((c) => [c.slug, c.name] as const),
);

function labelForCategory(slug: string): string {
  return categoryNameBySlug.get(slug) ?? slug;
}

/**
 * The search/filter/browse experience — real and functional against
 * whatever content is passed in. Today that's a handful of samples;
 * nothing here assumes a large dataset (it's a plain array filter, not a
 * search engine — see src/lib/content/filters.ts).
 */
function LearningContentBrowser({ items, showCategoryFilter = false }: LearningContentBrowserProps) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [ageYears, setAgeYears] = React.useState("");
  const [contentType, setContentType] = React.useState("");

  const availableContentTypes = React.useMemo(() => {
    const types = new Set(items.map((item) => item.contentType));
    return Array.from(types) as ContentType[];
  }, [items]);

  const availableCategories = React.useMemo(() => {
    const slugs = new Set(items.map((item) => item.category));
    return getAllLearningCategories().filter((c) => slugs.has(c.slug));
  }, [items]);

  const filters: ContentFilters = {
    query: query || undefined,
    category: category || undefined,
    ageYears: ageYears ? Number(ageYears) : undefined,
    contentType: (contentType as ContentType) || undefined,
  };

  const results = filterContent(items, filters);
  const hasActiveFilters = Boolean(query || category || ageYears || contentType);

  function clearFilters() {
    setQuery("");
    setCategory("");
    setAgeYears("");
    setContentType("");
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor="content-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <Input
              id="content-search"
              type="search"
              placeholder="Search titles…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {showCategoryFilter && (
          <div>
            <Label htmlFor="content-category">Category</Label>
            <Select id="content-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {availableCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="content-age">Age</Label>
          <Select id="content-age" value={ageYears} onChange={(e) => setAgeYears(e.target.value)}>
            <option value="">Any age</option>
            {[2, 3, 4, 5, 6, 7, 8].map((age) => (
              <option key={age} value={age}>
                {age} years
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="content-type">Content type</Label>
          <Select id="content-type" value={contentType} onChange={(e) => setContentType(e.target.value)}>
            <option value="">All types</option>
            {availableContentTypes.map((type) => (
              <option key={type} value={type}>
                {CONTENT_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-8">
        {results.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <LearningCard
                key={item.id}
                content={item}
                categoryName={labelForCategory(item.category)}
                isSample
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={hasActiveFilters ? "No content matches your filters" : "No content published yet"}
            description={
              hasActiveFilters
                ? "Try clearing a filter or searching for something else."
                : "Check back as lessons and resources are added."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

export { LearningContentBrowser };
