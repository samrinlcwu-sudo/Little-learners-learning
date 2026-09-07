"use client";

import { useState } from "react";
import { Apple } from "lucide-react";
import { ChoiceGamePlayer } from "@/components/games/choice-game-player";
import { useChoiceGame, type ChoiceRound } from "@/lib/games/use-choice-game";
import { recordProgressEvent } from "@/lib/progress/local-progress";
import type { GameComponentProps } from "@/lib/games/registry";

const COUNTS = [1, 2, 3, 4, 5];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRounds(): ChoiceRound[] {
  const order = shuffle(COUNTS);
  return order.map((count, index) => {
    const distractors = shuffle(COUNTS.filter((n) => n !== count)).slice(0, 2);
    const options = shuffle([count, ...distractors]).map((n) => ({
      id: `${count}-${n}`,
      label: String(n),
      isCorrect: n === count,
    }));
    return { id: `round-${index}-${count}`, prompt: String(count), options };
  });
}

/** Count a group of apples (1–5) and pick the matching number. Reuses the choice-game engine — only the prompt visual differs from Letter Match. */
function CountingGame({ skill, slug, title, category }: GameComponentProps) {
  const [rounds] = useState(buildRounds);
  const game = useChoiceGame(rounds, {
    onComplete: (result) =>
      recordProgressEvent({
        type: "game_completed",
        topic: category,
        activityLabel: title,
        activityHref: `/games/${slug}`,
        score: { correct: result.correctAnswers, total: result.totalRounds },
      }),
  });

  return (
    <ChoiceGamePlayer
      game={game}
      promptLabel="How many apples do you see?"
      skill={skill}
      renderPrompt={(round) => (
        <div
          className="mt-3 flex flex-wrap items-center justify-center gap-2"
          role="img"
          aria-label={`${round.prompt} apples`}
        >
          {Array.from({ length: Number(round.prompt) }).map((_, i) => (
            <Apple key={i} className="size-10 text-secondary-600" aria-hidden="true" fill="currentColor" />
          ))}
        </div>
      )}
    />
  );
}

export { CountingGame };
