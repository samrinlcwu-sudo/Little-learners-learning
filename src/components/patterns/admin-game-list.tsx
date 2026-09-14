"use client";

import * as React from "react";
import { Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { GAME_TYPE_LABELS, type GameType } from "@/lib/games/types";
import { filterAdminGames, type AdminGameFilters } from "@/lib/games/admin-game-filters";
import { getAllLearningCategories } from "@/config/learning-categories";
import { ACCESS_TIER_LABELS, type AccessTier } from "@/lib/resources/types";
import { PUBLICATION_STATUS_BADGE_VARIANT, PUBLICATION_STATUS_LABELS, type PublicationStatus } from "@/lib/content/types";

const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));

/**
 * A read-only inspection view (Prompt 67) — deliberately not full CRUD like
 * the Resources tab. Every game today is real, checked-in sample data
 * (SAMPLE_GAMES, src/lib/games/sample-games.ts); there is no
 * local-admin-games or local-teacher-games store, because no "create a
 * game" authoring flow exists anywhere in this codebase yet (see
 * src/config/teacher-resource-types.ts, which explicitly excludes games
 * from teacher-authored resources). Building a parallel write-store here
 * with nothing real to write would be exactly the invented capability the
 * project's honesty rules forbid — search and filtering are real, tested
 * logic, ready the moment a real authoring flow exists.
 */
function AdminGameList() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [gameType, setGameType] = React.useState<GameType | "">("");
  const [status, setStatus] = React.useState<PublicationStatus | "">("");
  const [accessTier, setAccessTier] = React.useState<AccessTier | "">("");

  const filters: AdminGameFilters = {
    query: query || undefined,
    category: category || undefined,
    gameType: gameType || undefined,
    status: status || undefined,
    accessTier: accessTier || undefined,
  };
  const hasActiveFilters = Boolean(query || category || gameType || status || accessTier);
  const filtered = filterAdminGames(SAMPLE_GAMES, filters);

  function clearFilters() {
    setQuery("");
    setCategory("");
    setGameType("");
    setStatus("");
    setAccessTier("");
  }

  return (
    <>
      <Alert variant="info" className="mb-8">
        Games don&apos;t have a creation flow yet — this is a real, working search over the platform&apos;s existing
        game catalog, not a stub. See docs/CONTENT_MANAGEMENT_ARCHITECTURE.md.
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor="admin-game-q">Search</Label>
          <Input id="admin-game-q" type="search" placeholder="Title, skill…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="admin-game-category">Category</Label>
          <Select id="admin-game-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {getAllLearningCategories().map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="admin-game-type">Game type</Label>
          <Select id="admin-game-type" value={gameType} onChange={(e) => setGameType(e.target.value as GameType | "")}>
            <option value="">All types</option>
            {(Object.keys(GAME_TYPE_LABELS) as GameType[]).map((type) => (
              <option key={type} value={type}>
                {GAME_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="admin-game-status">Status</Label>
          <Select id="admin-game-status" value={status} onChange={(e) => setStatus(e.target.value as PublicationStatus | "")}>
            <option value="">Any status</option>
            {(Object.keys(PUBLICATION_STATUS_LABELS) as PublicationStatus[]).map((s) => (
              <option key={s} value={s}>
                {PUBLICATION_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="admin-game-tier">Access</Label>
          <Select id="admin-game-tier" value={accessTier} onChange={(e) => setAccessTier(e.target.value as AccessTier | "")}>
            <option value="">Free &amp; premium</option>
            {(Object.keys(ACCESS_TIER_LABELS) as AccessTier[]).map((tier) => (
              <option key={tier} value={tier}>
                {ACCESS_TIER_LABELS[tier]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="No games match your filters"
            description="Try clearing a filter."
            action={
              <Button size="sm" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-surface-sunken text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Access</th>
                  <th className="px-4 py-3 font-medium">Accessibility notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filtered.map((game) => (
                  <tr key={game.id}>
                    <td className="px-4 py-3 font-medium text-ink">{game.title}</td>
                    <td className="px-4 py-3 text-neutral-600">{GAME_TYPE_LABELS[game.gameType]}</td>
                    <td className="px-4 py-3 text-neutral-600">{categoryNameBySlug.get(game.category ?? "") ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={PUBLICATION_STATUS_BADGE_VARIANT[game.publicationStatus]}>
                        {PUBLICATION_STATUS_LABELS[game.publicationStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{ACCESS_TIER_LABELS[game.accessTier]}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {game.accessibilityNotes && game.accessibilityNotes.length > 0 ? game.accessibilityNotes.length : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export { AdminGameList };
