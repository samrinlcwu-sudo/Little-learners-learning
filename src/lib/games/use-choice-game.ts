"use client";

import { useRef, useState } from "react";

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

export interface ChoiceGameResult {
  correctAnswers: number;
  totalRounds: number;
  attempts: number;
}

export interface UseChoiceGameOptions {
  /**
   * Fires once, the moment the last round is answered — with the raw
   * session numbers, nothing else. Every choice game passes this to call
   * recordProgressEvent (src/lib/progress/local-progress.ts) with a real
   * score, attributed to whichever child is currently active.
   */
  onComplete?: (result: ChoiceGameResult) => void;
}

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
export function useChoiceGame(rounds: ChoiceRound[], options: UseChoiceGameOptions = {}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [status, setStatus] = useState<"playing" | "completed">("playing");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<RoundFeedback>(null);
  const [missedThisRound, setMissedThisRound] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  // React state updates are batched, so a burst of clicks within the same
  // tick (a fast double-click, an eager tap) can all read the same stale
  // `feedback` value and each pass the "already answered" guard below,
  // inflating the score. A ref is mutated synchronously and immediately,
  // so it closes that gap — the score can never be higher than the number
  // of rounds actually answered correctly.
  const answeredCorrectlyRef = useRef(false);

  const currentRound = rounds[roundIndex];
  const isLastRound = roundIndex === rounds.length - 1;

  function selectOption(option: ChoiceOption) {
    if (answeredCorrectlyRef.current) return; // already answered correctly — wait for Next
    setSelectedId(option.id);
    setAttempts((a) => a + 1);
    if (option.isCorrect) {
      answeredCorrectlyRef.current = true;
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
      options.onComplete?.({ correctAnswers: score, totalRounds: rounds.length, attempts });
      return;
    }
    setRoundIndex((i) => i + 1);
    setSelectedId(null);
    setFeedback(null);
    setMissedThisRound(false);
    answeredCorrectlyRef.current = false;
  }

  function reset() {
    setRoundIndex(0);
    setStatus("playing");
    setSelectedId(null);
    setFeedback(null);
    setMissedThisRound(false);
    setScore(0);
    setAttempts(0);
    answeredCorrectlyRef.current = false;
  }

  return {
    status,
    currentRound,
    roundNumber: roundIndex + 1,
    totalRounds: rounds.length,
    selectedId,
    feedback,
    score,
    attempts,
    selectOption,
    nextRound,
    reset,
  };
}
