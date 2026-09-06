"use client";

import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameShell } from "@/components/games/game-shell";
import type { ChoiceRound, useChoiceGame } from "@/lib/games/use-choice-game";
import { cn } from "@/lib/utils/cn";

export interface ChoiceGamePlayerProps {
  game: ReturnType<typeof useChoiceGame>;
  /** The instruction line above the prompt — e.g. "Find the lowercase match for". */
  promptLabel: string;
  /** How this specific game visualizes its round's prompt — a letter, a row of objects, a shape, a color swatch. */
  renderPrompt: (round: ChoiceRound) => ReactNode;
}

/**
 * The shared UI for every choice-style game (letter match, counting, shape
 * match, color match, ...): options grid, feedback line, and the Next
 * button, all driven by `useChoiceGame`. Each game only supplies how its
 * own prompt looks — everything else (state, scoring, progress,
 * completion, accessibility) is identical and lives here once.
 */
function ChoiceGamePlayer({ game, promptLabel, renderPrompt }: ChoiceGamePlayerProps) {
  return (
    <GameShell
      status={game.status}
      roundNumber={game.roundNumber}
      totalRounds={game.totalRounds}
      score={game.score}
      onPlayAgain={game.reset}
    >
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-500">{promptLabel}</p>
        {renderPrompt(game.currentRound)}

        <div className="mt-8 grid grid-cols-3 gap-4">
          {game.currentRound.options.map((option) => {
            const isSelected = game.selectedId === option.id;
            const showCorrect = game.feedback && option.isCorrect;
            const showWrong = isSelected && game.feedback === "incorrect";

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => game.selectOption(option)}
                disabled={game.feedback === "correct"}
                aria-pressed={isSelected}
                className={cn(
                  "flex h-24 flex-col items-center justify-center gap-1 rounded-lg border-2 text-3xl font-semibold transition-colors motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40",
                  "disabled:cursor-not-allowed",
                  showCorrect
                    ? "border-success-600 bg-success-100 text-success-800"
                    : showWrong
                      ? "border-error-600 bg-error-100 text-error-800"
                      : "border-neutral-200 bg-surface text-ink hover:border-primary-300",
                )}
              >
                {option.label}
                {showCorrect && <Check className="size-5" aria-hidden="true" />}
                {showWrong && <X className="size-5" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="mt-5 min-h-8 text-sm font-medium">
          {game.feedback === "correct" && <p className="text-success-700">Correct! Well done.</p>}
          {game.feedback === "incorrect" && <p className="text-error-700">Not quite — try another one.</p>}
        </div>

        {game.feedback === "correct" && (
          <Button className="mt-2" onClick={game.nextRound}>
            {game.roundNumber === game.totalRounds ? "See your score" : "Next"}
          </Button>
        )}
      </div>
    </GameShell>
  );
}

export { ChoiceGamePlayer };
