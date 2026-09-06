import type { ComponentType } from "react";
import { LetterMatchGame } from "@/components/games/letter-match-game";
import { CountingGame } from "@/components/games/counting-game";
import { ShapeMatchGame } from "@/components/games/shape-match-game";
import { ColorMatchGame } from "@/components/games/color-match-game";
import { NumberMemoryGame } from "@/components/games/number-memory-game";

/**
 * Only a slug listed here has a real, playable implementation. Every other
 * published Game record is a legitimate roadmap entry — real metadata,
 * honestly labeled "Coming soon" — never a Play button pointing at
 * nothing. Add an entry here the same day the game component ships.
 */
export const GAME_COMPONENTS: Record<string, ComponentType> = {
  "letter-match": LetterMatchGame,
  "count-the-fruits": CountingGame,
  "shape-match": ShapeMatchGame,
  "color-match": ColorMatchGame,
  "number-memory": NumberMemoryGame,
};

export function isGamePlayable(slug: string): boolean {
  return slug in GAME_COMPONENTS;
}
