"use client";

import { useState } from "react";

export interface ChoiceOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface ChoiceRound {
  id: string;
  /** What's being asked — a letter, a number, a word, whatever the game shows as the prompt. */
  prompt: string;
  options: ChoiceOption[];
}

export type RoundFeedback = "correct" | "incorrect" | null;

/**
 * The reusable engine for every "show a prompt, pick the right option from
 * a few choices" game — matching, multiple-choice, identification, and
 * counting all fit this shape. Sorting/drag-and-drop/sequencing/pattern
 * games need a different state shape and aren't covered here.
 *
 * Deliberately forgiving: a wrong pick doesn't fail the round, just
 * disqualifies it from the score — the child can keep trying until they
 * get it, and only advances to the next round on their own action (no
 * auto-advance timers, which are hard to predict and easy to miss).
 */
export function useChoiceGame(rounds: ChoiceRound[]) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [status, setStatus] = useState<"playing" | "completed">("playing");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<RoundFeedback>(null);
  const [missedThisRound, setMissedThisRound] = useState(false);
  const [score, setScore] = useState(0);

  const currentRound = rounds[roundIndex];
  const isLastRound = roundIndex === rounds.length - 1;

  function selectOption(option: ChoiceOption) {
    if (feedback === "correct") return; // already answered correctly — wait for Next
    setSelectedId(option.id);
    if (option.isCorrect) {
      setFeedback("correct");
      if (!missedThisRound) setScore((s) => s + 1);
    } else {
      setFeedback("incorrect");
      setMissedThisRound(true);
    }
  }

  function nextRound() {
    if (isLastRound) {
      setStatus("completed");
      return;
    }
    setRoundIndex((i) => i + 1);
    setSelectedId(null);
    setFeedback(null);
    setMissedThisRound(false);
  }

  function reset() {
    setRoundIndex(0);
    setStatus("playing");
    setSelectedId(null);
    setFeedback(null);
    setMissedThisRound(false);
    setScore(0);
  }

  return {
    status,
    currentRound,
    roundNumber: roundIndex + 1,
    totalRounds: rounds.length,
    selectedId,
    feedback,
    score,
    selectOption,
    nextRound,
    reset,
  };
}
