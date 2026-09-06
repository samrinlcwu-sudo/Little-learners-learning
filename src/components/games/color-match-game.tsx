"use client";

import { useState } from "react";
import { ChoiceGamePlayer } from "@/components/games/choice-game-player";
import { useChoiceGame, type ChoiceRound } from "@/lib/games/use-choice-game";

/**
 * Real, universally-recognized color values — not the site's brand
 * palette. Teaching "this is red" has to use an actual red; standing in
 * the brand teal for "blue" would just be wrong.
 *
 * Known accessibility limitation, stated plainly rather than glossed
 * over: a game whose entire subject is color perception isn't meaningfully
 * playable without color vision. There's no code fix for that — it's
 * intrinsic to what the game teaches.
 */
const COLORS = [
  { name: "red", hex: "#DC2626" },
  { name: "blue", hex: "#2563EB" },
  { name: "green", hex: "#16A34A" },
  { name: "yellow", hex: "#EAB308" },
] as const;

const colorByName = new Map<string, string>(COLORS.map((c) => [c.name, c.hex]));

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRounds(): ChoiceRound[] {
  const names = COLORS.map((c) => c.name);
  const order = shuffle(names);
  return order.map((name, index) => {
    const distractors = shuffle(names.filter((n) => n !== name)).slice(0, 2);
    const options = shuffle([name, ...distractors]).map((n) => ({
      id: `${name}-${n}`,
      label: capitalize(n),
      isCorrect: n === name,
    }));
    return { id: `round-${index}-${name}`, prompt: name, options };
  });
}

/** Identify a color swatch and pick its name. Reuses the choice-game engine. */
function ColorMatchGame() {
  const [rounds] = useState(buildRounds);
  const game = useChoiceGame(rounds);

  return (
    <ChoiceGamePlayer
      game={game}
      promptLabel="What color is this?"
      renderPrompt={(round) => (
        <div className="mt-3 flex justify-center">
          <div
            className="size-20 rounded-full border border-black/10"
            style={{ backgroundColor: colorByName.get(round.prompt) }}
            role="img"
            aria-label={capitalize(round.prompt)}
          />
        </div>
      )}
    />
  );
}

export { ColorMatchGame };
