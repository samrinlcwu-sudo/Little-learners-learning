"use client";

import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RewardBadge } from "@/components/games/reward-badge";
import { getAccuracyReward } from "@/lib/games/rewards";

export interface GameShellProps {
  status: "playing" | "completed";
  roundNumber: number;
  totalRounds: number;
  score: number;
  /** What this game practices — shown on the completion screen (e.g. "Letter recognition"). */
  skill: string;
  onPlayAgain: () => void;
  children: React.ReactNode;
}

/**
 * The chrome every choice-style game shares: a round counter, a live
 * score, and a completion screen — separate from any single game's own
 * prompt/options rendering (that's the game's job, passed in as children).
 */
function GameShell({ status, roundNumber, totalRounds, score, skill, onPlayAgain, children }: GameShellProps) {
  if (status === "completed") {
    const reward = getAccuracyReward(score, totalRounds);
    return (
      <Card className="flex flex-col items-center gap-5 p-10 text-center">
        <PartyPopper className="size-10 text-primary-600" aria-hidden="true" />
        <div>
          <p className="font-display text-xl font-semibold text-ink">Well done!</p>
          <p className="mt-1 text-neutral-600">
            You practiced <span className="font-medium text-ink">{skill}</span> — {score} of {totalRounds} correct.
          </p>
        </div>
        <RewardBadge reward={reward} />
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={onPlayAgain}>Play again</Button>
          <Button variant="outline" asChild>
            <Link href="/games">Back to Games Hub</Link>
          </Button>
        </div>
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
