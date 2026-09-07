"use client";

import { MemoryGame } from "@/components/games/memory-game";
import { recordProgressEvent } from "@/lib/progress/local-progress";
import type { GameComponentProps } from "@/lib/games/registry";

const NUMBER_CONCEPTS = [
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
  { id: "4", label: "4" },
];

/** Flip cards to find each matching pair of numbers. Reuses the memory-game engine. */
function NumberMemoryGame({ skill, slug, title, category }: GameComponentProps) {
  return (
    <MemoryGame
      concepts={NUMBER_CONCEPTS}
      conceptNoun="Number"
      skill={skill}
      onComplete={(result) =>
        recordProgressEvent({
          type: "game_completed",
          topic: category,
          activityLabel: title,
          activityHref: `/games/${slug}`,
          score: { correct: result.totalPairs, total: result.totalPairs },
        })
      }
    />
  );
}

export { NumberMemoryGame };
