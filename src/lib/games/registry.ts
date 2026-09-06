import type { ComponentType } from "react";
import { LetterMatchGame } from "@/components/games/letter-match-game";

/**
 * Only a slug listed here has a real, playable implementation. Every other
 * published Game record is a legitimate roadmap entry — real metadata,
 * honestly labeled "Coming soon" — never a Play button pointing at
 * nothing. Add an entry here the same day the game component ships.
 */
export const GAME_COMPONENTS: Record<string, ComponentType> = {
  "letter-match": LetterMatchGame,
};

export function isGamePlayable(slug: string): boolean {
  return slug in GAME_COMPONENTS;
}
