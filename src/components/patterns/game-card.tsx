import Link from "next/link";
import { Clock, Gamepad2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GAME_TYPE_LABELS, type Game } from "@/lib/games/types";
import { isGamePlayable } from "@/lib/games/registry";

export interface GameCardProps {
  game: Game;
  categoryName?: string;
}

const DIFFICULTY_LABELS: Record<Game["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/**
 * Same honesty rule as ResourceCard: only a game with a real, registered
 * component gets a "Play now" link. Everything else — real metadata,
 * clearly labeled "Coming soon" — never a Play button that goes nowhere.
 */
function GameCard({ game, categoryName }: GameCardProps) {
  const playable = isGamePlayable(game.slug);

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-surface-sunken px-6 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
          <Gamepad2 className="size-5 text-primary-700" aria-hidden="true" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {GAME_TYPE_LABELS[game.gameType]}
        </p>
      </div>

      <CardHeader>
        <Badge variant="primary" className="w-fit">
          {categoryName ?? game.skill}
        </Badge>
        <CardTitle className="mt-2">{game.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-neutral-600">{game.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">
            Ages {game.ageRange.minYears}–{game.ageRange.maxYears}
          </Badge>
          <Badge variant="neutral">{DIFFICULTY_LABELS[game.difficulty]}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
            <Clock className="size-3.5" aria-hidden="true" />
            {game.estimatedMinutes} min
          </span>
        </div>
      </CardContent>
      <CardFooter>
        {playable ? (
          <Button size="sm" asChild className="w-full">
            <Link href={`/games/${game.slug}`}>Play now</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" asChild className="w-full">
            <Link href={`/games/${game.slug}`}>Details — coming soon</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export { GameCard };
