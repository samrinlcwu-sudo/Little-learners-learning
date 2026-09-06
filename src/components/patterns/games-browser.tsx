"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GameCard } from "@/components/patterns/game-card";
import { isGamePublished, type Game } from "@/lib/games/types";
import type { DifficultyLevel as GameDifficulty } from "@/lib/content/types";
import { getAllLearningCategories } from "@/config/learning-categories";

export interface GamesBrowserProps {
  games: Game[];
}

const categoryNameBySlug = new Map(
  getAllLearningCategories().map((c) => [c.slug, c.name] as const),
);

const DIFFICULTY_LABELS: Record<GameDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/**
 * Client-side, like the Learning Hub's browser rather than the Resource
 * Library's server-driven one — games are hand-built one at a time, so
 * this list will stay small for a long while, unlike a document library.
 * Search-ready: swapping this for a real search index later doesn't
 * change the shape callers pass in.
 */
function GamesBrowser({ games }: GamesBrowserProps) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [ageYears, setAgeYears] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("");

  const published = React.useMemo(() => games.filter(isGamePublished), [games]);

  const availableCategories = React.useMemo(() => {
    const slugs = new Set(published.map((g) => g.category).filter(Boolean));
    return getAllLearningCategories().filter((c) => slugs.has(c.slug));
  }, [published]);

  const results = published.filter((game) => {
    if (category && game.category !== category) return false;
    if (difficulty && game.difficulty !== difficulty) return false;
    if (ageYears) {
      const age = Number(ageYears);
      if (age < game.ageRange.minYears || age > game.ageRange.maxYears) return false;
    }
    if (query) {
      const q = query.trim().toLowerCase();
      const haystack = `${game.title} ${game.description} ${game.skill}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
    }
    return true;
  });

  const hasActiveFilters = Boolean(query || category || ageYears || difficulty);

  function clearFilters() {
    setQuery("");
    setCategory("");
    setAgeYears("");
    setDifficulty("");
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor="game-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <Input
              id="game-search"
              type="search"
              placeholder="Search games…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="game-category">Category</Label>
          <Select id="game-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {availableCategories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="game-age">Age</Label>
          <Select id="game-age" value={ageYears} onChange={(e) => setAgeYears(e.target.value)}>
            <option value="">Any age</option>
            {[2, 3, 4, 5, 6, 7, 8].map((age) => (
              <option key={age} value={age}>
                {age} years
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="game-difficulty">Difficulty</Label>
          <Select id="game-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">Any difficulty</option>
            {(Object.keys(DIFFICULTY_LABELS) as GameDifficulty[]).map((level) => (
              <option key={level} value={level}>
                {DIFFICULTY_LABELS[level]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-8">
        {results.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                categoryName={game.category ? categoryNameBySlug.get(game.category) : undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={hasActiveFilters ? "No games match your filters" : "No games published yet"}
            description={
              hasActiveFilters
                ? "Try clearing a filter or searching for something else."
                : "Check back as more games are added."
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

export { GamesBrowser };
