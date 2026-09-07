"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { Spinner } from "@/components/ui/loading";
import { recordProgressEvent } from "@/lib/progress/local-progress";
import type { GameComponentProps } from "@/lib/games/registry";

/**
 * Every game builds its rounds/cards with Math.random() the moment it
 * mounts (see each game's `buildRounds`/`buildDeck`). Rendered on the
 * server, that produces one random order; the client then computes a
 * different one during hydration — a guaranteed hydration mismatch
 * (React error #418), which is exactly what was happening before this
 * file existed. There's no SEO value in prerendering a randomized game
 * board, so every game loads client-only (`ssr: false`) instead.
 */
const GAME_LOADERS: Record<string, ComponentType<GameComponentProps>> = {
  "letter-match": dynamic(() => import("./letter-match-game").then((m) => m.LetterMatchGame), {
    ssr: false,
    loading: () => <GameLoadingPlaceholder />,
  }),
  "count-the-fruits": dynamic(() => import("./counting-game").then((m) => m.CountingGame), {
    ssr: false,
    loading: () => <GameLoadingPlaceholder />,
  }),
  "shape-match": dynamic(() => import("./shape-match-game").then((m) => m.ShapeMatchGame), {
    ssr: false,
    loading: () => <GameLoadingPlaceholder />,
  }),
  "color-match": dynamic(() => import("./color-match-game").then((m) => m.ColorMatchGame), {
    ssr: false,
    loading: () => <GameLoadingPlaceholder />,
  }),
  "number-memory": dynamic(() => import("./number-memory-game").then((m) => m.NumberMemoryGame), {
    ssr: false,
    loading: () => <GameLoadingPlaceholder />,
  }),
};

function GameLoadingPlaceholder() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-lg border border-neutral-200 p-10">
      <Spinner label="Loading game…" />
    </div>
  );
}

export interface GamePlayerProps extends GameComponentProps {
  slug: string;
}

function GamePlayer({ slug, skill, title, category }: GamePlayerProps) {
  const Game = GAME_LOADERS[slug];

  useEffect(() => {
    recordProgressEvent({
      type: "game_played",
      topic: category,
      activityLabel: title,
      activityHref: `/games/${slug}`,
    });
    // Record once per real game visit — re-firing on every render would
    // count one visit as many.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!Game) return null;
  return <Game skill={skill} slug={slug} title={title} category={category} />;
}

export { GamePlayer };
