import type { AccessTier } from "@/lib/resources/types";
import type { DifficultyLevel, PublicationStatus } from "@/lib/content/types";
import type { Game, GameType } from "./types";

/**
 * The admin games view's filter shape (Prompt 67) — deliberately never
 * gates on `isGamePublished()` the way the public Games Hub does, since an
 * admin reviewing the catalog needs to see an unpublished or
 * pending-review game too. There is no admin-authored or teacher-submitted
 * game yet (SAMPLE_GAMES is the only real source — see
 * docs/GAMES_HUB_ARCHITECTURE.md), so unlike resources this filters a
 * plain `Game[]`, not a combined multi-source row list.
 */
export interface AdminGameFilters {
  query?: string;
  category?: string;
  gameType?: GameType;
  ageYears?: number;
  difficulty?: DifficultyLevel;
  accessTier?: AccessTier;
  status?: PublicationStatus;
}

export function filterAdminGames(games: Game[], filters: AdminGameFilters): Game[] {
  return games.filter((game) => {
    if (filters.category && game.category !== filters.category) return false;
    if (filters.gameType && game.gameType !== filters.gameType) return false;
    if (filters.difficulty && game.difficulty !== filters.difficulty) return false;
    if (filters.accessTier && game.accessTier !== filters.accessTier) return false;
    if (filters.status && game.publicationStatus !== filters.status) return false;
    if (
      filters.ageYears != null &&
      (filters.ageYears < game.ageRange.minYears || filters.ageYears > game.ageRange.maxYears)
    ) {
      return false;
    }
    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      const haystack = `${game.title} ${game.description} ${game.skill}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
    }
    return true;
  });
}
