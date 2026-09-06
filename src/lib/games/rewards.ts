/**
 * A simple, positive, non-competitive reward: 1–3 stars plus a short title
 * and message. Never 0 — finishing a game is worth acknowledging even on
 * an off day. Nothing here is stored, shared, or compared between
 * children; it exists only to display on the completion screen for the
 * child who just played.
 */
export interface RewardResult {
  stars: 1 | 2 | 3;
  title: string;
  message: string;
}

/** For choice-style games, scored by first-try accuracy. */
export function getAccuracyReward(correct: number, total: number): RewardResult {
  const ratio = total > 0 ? correct / total : 0;

  if (ratio >= 1) {
    return { stars: 3, title: "Star Learner!", message: "You got every one right." };
  }
  if (ratio >= 0.6) {
    return { stars: 2, title: "Well Done!", message: "Great effort — you're getting really good at this." };
  }
  return { stars: 1, title: "Nice Try!", message: "You finished the game — that's what counts." };
}

/**
 * For memory-style games: completion itself is the achievement. Scoring
 * on speed or move count would punish a child who plays carefully rather
 * than quickly, which isn't a value this platform wants to teach — so
 * finishing always earns the top, encouraging tier.
 */
export function getCompletionReward(): RewardResult {
  return { stars: 3, title: "Star Learner!", message: "You found every matching pair." };
}
