"use client";

import { useState } from "react";

export interface MemoryConcept {
  id: string;
  label: string;
}

export interface MemoryCard {
  cardId: string;
  conceptId: string;
  label: string;
}

export interface MemoryGameResult {
  moves: number;
  totalPairs: number;
}

export interface UseMemoryGameOptions {
  /**
   * Fires once, the moment the last pair is matched — with the raw
   * session numbers, nothing else. NumberMemoryGame passes this to call
   * recordProgressEvent (src/lib/progress/local-progress.ts) with a real
   * result, attributed to whichever child is currently active.
   */
  onComplete?: (result: MemoryGameResult) => void;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck(concepts: MemoryConcept[]): MemoryCard[] {
  return shuffle(
    concepts.flatMap((concept) => [
      { cardId: `${concept.id}-a`, conceptId: concept.id, label: concept.label },
      { cardId: `${concept.id}-b`, conceptId: concept.id, label: concept.label },
    ]),
  );
}

/**
 * The engine for flip-and-match games — a genuinely different shape from
 * useChoiceGame's "prompt + pick an option", so it gets its own hook
 * rather than being forced into that one.
 *
 * Deliberately un-timed: a non-matching pair stays face-up until the
 * player clicks "Continue" (no setTimeout auto-flip-back), so nothing
 * changes on screen without the player's own action — easier to follow
 * for young children and for anyone using assistive tech.
 */
export function useMemoryGame(concepts: MemoryConcept[], options: UseMemoryGameOptions = {}) {
  const [cards] = useState(() => buildDeck(concepts));
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedConceptIds, setMatchedConceptIds] = useState<Set<string>>(new Set());
  const [pendingMismatch, setPendingMismatch] = useState(false);
  const [moves, setMoves] = useState(0);

  const totalPairs = concepts.length;
  const isComplete = matchedConceptIds.size === totalPairs;

  function flipCard(cardId: string) {
    if (pendingMismatch || isComplete) return;
    if (flippedIds.includes(cardId) || flippedIds.length === 2) return;

    const card = cards.find((c) => c.cardId === cardId);
    if (!card || matchedConceptIds.has(card.conceptId)) return;

    const next = [...flippedIds, cardId];
    setFlippedIds(next);

    if (next.length === 2) {
      const movesTaken = moves + 1;
      setMoves(movesTaken);
      const [firstId, secondId] = next;
      const first = cards.find((c) => c.cardId === firstId)!;
      const second = cards.find((c) => c.cardId === secondId)!;

      if (first.conceptId === second.conceptId) {
        setMatchedConceptIds((prev) => {
          const updated = new Set(prev).add(first.conceptId);
          if (updated.size === totalPairs) {
            options.onComplete?.({ moves: movesTaken, totalPairs });
          }
          return updated;
        });
        setFlippedIds([]);
      } else {
        setPendingMismatch(true);
      }
    }
  }

  function continueAfterMismatch() {
    setFlippedIds([]);
    setPendingMismatch(false);
  }

  function isCardVisible(card: MemoryCard) {
    return matchedConceptIds.has(card.conceptId) || flippedIds.includes(card.cardId);
  }

  function reset() {
    setFlippedIds([]);
    setMatchedConceptIds(new Set());
    setPendingMismatch(false);
    setMoves(0);
  }

  return {
    cards,
    matchedConceptIds,
    pendingMismatch,
    moves,
    totalPairs,
    isComplete,
    flipCard,
    continueAfterMismatch,
    isCardVisible,
    reset,
  };
}
