"use client";

import { MemoryGame } from "@/components/games/memory-game";
import type { GameComponentProps } from "@/lib/games/registry";

const NUMBER_CONCEPTS = [
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
  { id: "4", label: "4" },
];

/** Flip cards to find each matching pair of numbers. Reuses the memory-game engine. */
function NumberMemoryGame({ skill }: GameComponentProps) {
  return <MemoryGame concepts={NUMBER_CONCEPTS} conceptNoun="Number" skill={skill} />;
}

export { NumberMemoryGame };
