"use client";

import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface GameShellProps {
  status: "playing" | "completed";
  roundNumber: number;
  totalRounds: number;
  score: number;
  onPlayAgain: () => void;
  children: React.ReactNode;
}

/**
 * The chrome every choice-style game shares: a round counter, a live
 * score, and a completion screen — separate from any single game's own
 * prompt/options rendering (that's the game's job, passed in as children).
 */
function GameShell({ status, roundNumber, totalRounds, score, onPlayAgain, children }: GameShellProps) {
  if (status === "completed") {
    return (
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <PartyPopper className="size-10 text-primary-600" aria-hidden="true" />
        <div>
          <p className="font-display text-xl font-semibold text-ink">Great job!</p>
          <p className="mt-1 text-neutral-600">
            You got {score} of {totalRounds} right.
          </p>
        </div>
        <Button onClick={onPlayAgain}>Play again</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-10">
      <div className="mb-6 flex items-center justify-between text-sm text-neutral-500">
        <span>
          Round {roundNumber} of {totalRounds}
        </span>
        <span aria-live="polite">Score: {score}</span>
      </div>
      {children}
    </Card>
  );
}

export { GameShell };
