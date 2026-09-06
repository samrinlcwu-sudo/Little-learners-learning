"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameShell } from "@/components/games/game-shell";
import { useChoiceGame, type ChoiceRound } from "@/lib/games/use-choice-game";
import { cn } from "@/lib/utils/cn";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRounds(): ChoiceRound[] {
  const order = shuffle(LETTERS);
  return order.map((letter, index) => {
    const distractors = shuffle(LETTERS.filter((l) => l !== letter)).slice(0, 2);
    const options = shuffle([letter, ...distractors]).map((l) => ({
      id: `${letter}-${l}`,
      label: l.toLowerCase(),
      isCorrect: l === letter,
    }));
    return { id: `round-${index}-${letter}`, prompt: letter, options };
  });
}

/**
 * The one real, playable game — proves the engine (useChoiceGame + GameShell)
 * end to end. Uses only the real English alphabet, real buttons (keyboard
 * operable by default), and feedback that never relies on color alone.
 */
function LetterMatchGame() {
  const [rounds] = useState(buildRounds);
  const game = useChoiceGame(rounds);

  return (
    <GameShell
      status={game.status}
      roundNumber={game.roundNumber}
      totalRounds={game.totalRounds}
      score={game.score}
      onPlayAgain={game.reset}
    >
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-500">Find the lowercase match for</p>
        <p className="font-display text-6xl font-bold text-primary-700" aria-hidden="true">
          {game.currentRound.prompt}
        </p>
        <p className="sr-only">Target letter: {game.currentRound.prompt}</p>

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
            {game.roundNumber === game.totalRounds ? "See your score" : "Next letter"}
          </Button>
        )}
      </div>
    </GameShell>
  );
}

export { LetterMatchGame };
