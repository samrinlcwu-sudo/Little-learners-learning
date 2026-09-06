import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { GameCard } from "@/components/patterns/game-card";
import { GamePlayer } from "@/components/games/game-player";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { isGamePlayable } from "@/lib/games/registry";
import { GAME_TYPE_LABELS, isGamePublished, type Game } from "@/lib/games/types";
import { siteConfig } from "@/config/site";

const DIFFICULTY_LABELS: Record<Game["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function generateStaticParams() {
  return SAMPLE_GAMES.filter(isGamePublished).map((game) => ({ game: game.slug }));
}

function findPublishedGame(slug: string): Game | undefined {
  return SAMPLE_GAMES.find((g) => g.slug === slug && isGamePublished(g));
}

export async function generateMetadata({
  params,
}: PageProps<"/games/[game]">): Promise<Metadata> {
  const { game: slug } = await params;
  const game = findPublishedGame(slug);
  if (!game) return {};

  return {
    title: game.title,
    description: game.description,
    alternates: { canonical: `${siteConfig.url}/games/${game.slug}` },
  };
}

export default async function GameDetailPage({
  params,
}: PageProps<"/games/[game]">) {
  const { game: slug } = await params;
  const game = findPublishedGame(slug);

  if (!game) {
    notFound();
  }

  const category = game.category ? getLearningCategoryBySlug(game.category) : undefined;
  const playable = isGamePlayable(game.slug);
  const canonicalUrl = `${siteConfig.url}/games/${game.slug}`;

  const related = SAMPLE_GAMES.filter(
    (g) => g.slug !== game.slug && isGamePublished(g) && (g.category === game.category || g.gameType === game.gameType),
  ).slice(0, 3);

  // Structured data reflects only fields the model actually carries.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["LearningResource", "Game"],
    name: game.title,
    description: game.description,
    url: canonicalUrl,
    learningResourceType: GAME_TYPE_LABELS[game.gameType],
    teaches: game.learningObjective,
    typicalAgeRange: `${game.ageRange.minYears}-${game.ageRange.maxYears}`,
    inLanguage: "en",
    isAccessibleForFree: true,
  };

  return (
    <Section>
      <Container>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <div className="max-w-2xl">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Games", href: "/games" },
              { label: game.title },
            ]}
          />
          <Heading level="h1" className="mt-4">
            {game.title}
          </Heading>
          <p className="mt-3 text-neutral-600">{game.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {category && (
              <Link href={`/learn/${category.slug}`}>
                <Badge variant="primary">{category.name}</Badge>
              </Link>
            )}
            <Badge variant="neutral">
              Ages {game.ageRange.minYears}–{game.ageRange.maxYears}
            </Badge>
            <Badge variant="neutral">{DIFFICULTY_LABELS[game.difficulty]}</Badge>
            <Badge variant="neutral">{GAME_TYPE_LABELS[game.gameType]}</Badge>
            <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
              <Clock className="size-4" aria-hidden="true" />
              About {game.estimatedMinutes} min
            </span>
          </div>

          <dl className="mt-8 grid gap-4 border-y border-neutral-200 py-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Skill</dt>
              <dd className="mt-1 text-sm text-ink">{game.skill}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Learning objective</dt>
              <dd className="mt-1 text-sm text-ink">{game.learningObjective}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              How to play
            </Heading>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink">
              {game.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          {game.accessibilityNotes && game.accessibilityNotes.length > 0 && (
            <div className="mt-6">
              <Heading level="h5" as="h2" className="text-neutral-500">
                Accessibility
              </Heading>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-600">
                {game.accessibilityNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 max-w-2xl">
          {playable ? (
            <GamePlayer slug={game.slug} skill={game.skill} />
          ) : (
            <EmptyState
              title="This game is coming soon"
              description={`${game.title} is on the roadmap but hasn't been built yet. Check back soon.`}
            />
          )}
        </div>

        {related.length > 0 && (
          <div className="mt-12 max-w-2xl border-t border-neutral-200 pt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              Related games
            </Heading>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {related.map((g) => (
                <GameCard
                  key={g.id}
                  game={g}
                  categoryName={g.category ? getLearningCategoryBySlug(g.category)?.name : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
