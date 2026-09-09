import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/patterns/page-header";
import { GameCard } from "@/components/patterns/game-card";
import { GamesBrowser } from "@/components/patterns/games-browser";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { isGamePublished } from "@/lib/games/types";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "The Little Learners Learning Games Hub — educational games for letter recognition, counting, shapes, and more.";

export const metadata: Metadata = {
  title: "Games",
  description,
  alternates: { canonical: `${siteConfig.url}/games` },
  ...buildSocialMetadata("Games — " + siteConfig.name, description, "/games"),
};

export default function GamesPage() {
  const featured = SAMPLE_GAMES.filter((g) => g.featured);
  const published = SAMPLE_GAMES.filter(isGamePublished);

  // Names every game that's actually published and reachable at its own
  // /games/[game] URL — the same unfiltered set GamesBrowser renders before
  // any client-side search/filter runs, so this never claims more than a
  // crawler (or a no-JS visitor) can see on this page.
  const structuredData =
    published.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: published.map((game, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${siteConfig.url}/games/${game.slug}`,
            name: game.title,
          })),
        }
      : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Games" }]}
        eyebrow="Games Hub"
        title="Games"
        description="Every game here is built around a specific skill — not random entertainment. Pick a game below, or search and filter to find one for a particular age or subject."
        surface="tint-accent"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container>
          {featured.length > 0 && (
            <div>
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
    </>
  );
}
