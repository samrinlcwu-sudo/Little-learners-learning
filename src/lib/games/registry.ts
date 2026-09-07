export interface GameComponentProps {
  /** The Game record's own `skill` — passed down so the completion screen can say what was practiced. */
  skill: string;
  /** The Game record's own `slug` — needed to record progress events against the right activity. */
  slug: string;
  /** The Game record's own `title` — the human-readable label progress events show a parent. */
  title: string;
  /** The Game record's own `category`, when it has one — lets a progress event say which subject this practiced. */
  category?: string;
}

/**
 * Only a slug listed here has a real, playable implementation. Every other
 * published Game record is a legitimate roadmap entry — real metadata,
 * honestly labeled "Coming soon" — never a Play button pointing at
 * nothing. Add an entry here (and to GAME_LOADERS in
 * src/components/games/game-player.tsx) the same day the game ships.
 */
const PLAYABLE_GAME_SLUGS = new Set([
  "letter-match",
  "count-the-fruits",
  "shape-match",
  "color-match",
  "number-memory",
]);

export function isGamePlayable(slug: string): boolean {
  return PLAYABLE_GAME_SLUGS.has(slug);
}
