"use client";

import { useState } from "react";
import { ChoiceGamePlayer } from "@/components/games/choice-game-player";
import { useChoiceGame, type ChoiceRound } from "@/lib/games/use-choice-game";
import { recordProgressEvent } from "@/lib/progress/local-progress";
import type { GameComponentProps } from "@/lib/games/registry";

const SHAPES = ["circle", "square", "triangle", "rectangle"] as const;
type ShapeName = (typeof SHAPES)[number];

const SHAPE_LABELS: Record<ShapeName, string> = {
  circle: "Circle",
  square: "Square",
  triangle: "Triangle",
  rectangle: "Rectangle",
};

/** Drawn by hand (not an icon set) so all four shapes share exactly the same fill, size logic, and visual weight. */
function ShapeGraphic({ shape }: { shape: ShapeName }) {
  switch (shape) {
    case "circle":
      return <div className="size-20 rounded-full bg-primary-600" />;
    case "square":
      return <div className="size-20 rounded-md bg-primary-600" />;
    case "rectangle":
      return <div className="h-14 w-24 rounded-md bg-primary-600" />;
    case "triangle":
      return (
        <svg viewBox="0 0 100 100" className="size-20">
          <polygon points="50,8 92,90 8,90" fill="currentColor" className="text-primary-600" />
        </svg>
      );
  }
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
  const order = shuffle([...SHAPES]);
  return order.map((shape, index) => {
    const distractors = shuffle(SHAPES.filter((s) => s !== shape)).slice(0, 2);
    const options = shuffle([shape, ...distractors]).map((s) => ({
      id: `${shape}-${s}`,
      label: SHAPE_LABELS[s],
      isCorrect: s === shape,
    }));
    return { id: `round-${index}-${shape}`, prompt: shape, options };
  });
}

/** Identify a shape and pick its name. Reuses the choice-game engine. */
function ShapeMatchGame({ skill, slug, title, category }: GameComponentProps) {
  const [rounds] = useState(buildRounds);
  const game = useChoiceGame(rounds, {
    onComplete: (result) =>
      recordProgressEvent({
        type: "game_completed",
        topic: category,
        activityLabel: title,
        activityHref: `/games/${slug}`,
        score: { correct: result.correctAnswers, total: result.totalRounds },
      }),
  });

  return (
    <ChoiceGamePlayer
      game={game}
      promptLabel="What shape is this?"
      skill={skill}
      renderPrompt={(round) => (
        <div className="mt-3 flex justify-center" role="img" aria-label={SHAPE_LABELS[round.prompt as ShapeName]}>
          <ShapeGraphic shape={round.prompt as ShapeName} />
        </div>
      )}
    />
  );
}

export { ShapeMatchGame };
