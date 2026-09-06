"use client";

import Link from "next/link";
import { HelpCircle, PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RewardBadge } from "@/components/games/reward-badge";
import { useMemoryGame, type MemoryConcept } from "@/lib/games/use-memory-game";
import { getCompletionReward } from "@/lib/games/rewards";
import { cn } from "@/lib/utils/cn";

export interface MemoryGameProps {
  concepts: MemoryConcept[];
  /** e.g. "number" or "shape" — used only for the completion message and card aria-labels. */
  conceptNoun: string;
  /** What this game practices — shown on the completion screen (e.g. "Number recognition"). */
  skill: string;
}

/**
 * The shared UI for any flip-and-match game — grid of cards, mismatch
 * recovery, and completion screen. What the cards represent (numbers,
 * shapes, letters, ...) is entirely supplied via `concepts`.
 */
function MemoryGame({ concepts, conceptNoun, skill }: MemoryGameProps) {
  const game = useMemoryGame(concepts);

  if (game.isComplete) {
    const reward = getCompletionReward();
    return (
      <Card className="flex flex-col items-center gap-5 p-10 text-center">
        <PartyPopper className="size-10 text-primary-600" aria-hidden="true" />
        <div>
          <p className="font-display text-xl font-semibold text-ink">Well done!</p>
          <p className="mt-1 text-neutral-600">
            You practiced <span className="font-medium text-ink">{skill}</span> — all {game.totalPairs} pairs
            matched in {game.moves} moves.
          </p>
        </div>
        <RewardBadge reward={reward} />
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={game.reset}>Play again</Button>
          <Button variant="outline" asChild>
            <Link href="/games">Back to Games Hub</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-10">
      <div className="mb-6 flex items-center justify-between text-sm text-neutral-500">
        <span aria-live="polite">
          {game.matchedConceptIds.size} of {game.totalPairs} pairs matched
        </span>
        <span>Moves: {game.moves}</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {game.cards.map((card) => {
          const visible = game.isCardVisible(card);
          const matched = game.matchedConceptIds.has(card.conceptId);
          return (
            <button
              key={card.cardId}
              type="button"
              onClick={() => game.flipCard(card.cardId)}
              disabled={visible || game.pendingMismatch}
              aria-label={visible ? `${conceptNoun} ${card.label}` : "Face-down card"}
              aria-pressed={visible}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border-2 text-2xl font-semibold transition-colors motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40",
                "disabled:cursor-not-allowed",
                matched
                  ? "border-success-600 bg-success-100 text-success-800"
                  : visible
                    ? "border-primary-300 bg-primary-50 text-primary-800"
                    : "border-neutral-200 bg-surface text-neutral-300 hover:border-primary-300",
              )}
            >
              {visible ? card.label : <HelpCircle className="size-6" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-5 min-h-8 text-center text-sm font-medium">
        {game.pendingMismatch && <p className="text-error-700">Not quite a match — try again.</p>}
      </div>

      {game.pendingMismatch && (
        <div className="flex justify-center">
          <Button onClick={game.continueAfterMismatch}>Continue</Button>
        </div>
      )}
    </Card>
  );
}

export { MemoryGame };
