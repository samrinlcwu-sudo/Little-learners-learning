"use client";

import { useState } from "react";
import { ChoiceGamePlayer } from "@/components/games/choice-game-player";
import { useChoiceGame, type ChoiceRound } from "@/lib/games/use-choice-game";
import type { GameComponentProps } from "@/lib/games/registry";

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
 * The first real game — proves the engine end to end. Uses only the real
 * English alphabet and the shared ChoiceGamePlayer UI.
 */
function LetterMatchGame({ skill }: GameComponentProps) {
  const [rounds] = useState(buildRounds);
  const game = useChoiceGame(rounds);

  return (
    <ChoiceGamePlayer
      game={game}
      promptLabel="Find the lowercase match for"
      skill={skill}
      renderPrompt={(round) => (
        <>
          <p className="font-display text-6xl font-bold text-primary-700" aria-hidden="true">
            {round.prompt}
          </p>
          <p className="sr-only">Target letter: {round.prompt}</p>
        </>
      )}
    />
  );
}

export { LetterMatchGame };
