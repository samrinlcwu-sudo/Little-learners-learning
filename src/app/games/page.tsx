import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { GameCard } from "@/components/patterns/game-card";
import { GamesBrowser } from "@/components/patterns/games-browser";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Games",
  description:
    "The Little Learners Learning Games Hub — educational games for letter recognition, counting, shapes, and more.",
  alternates: { canonical: `${siteConfig.url}/games` },
};

export default function GamesPage() {
  const featured = SAMPLE_GAMES.filter((g) => g.featured);

  return (
    <Section>
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Games" }]} />
        <Heading level="h1" className="mt-4">
          Games
        </Heading>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Every game here is built around a specific skill — not random
          entertainment. Pick a game below, or search and filter to find one
          for a particular age or subject.
        </p>

        {featured.length > 0 && (
          <div className="mt-12">
            <Heading level="h4" as="h2" className="text-neutral-500">
              Featured
            </Heading>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  categoryName={game.category ? getLearningCategoryBySlug(game.category)?.name : undefined}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <Heading level="h4" as="h2" className="text-neutral-500">
            All games
          </Heading>
          <div className="mt-4">
            <GamesBrowser games={SAMPLE_GAMES} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
