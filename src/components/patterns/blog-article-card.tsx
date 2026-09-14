import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BLOG_AUDIENCE_LABELS, type BlogArticle } from "@/lib/blog/types";

export interface BlogArticleCardProps {
  article: BlogArticle;
  topicName?: string;
}

/**
 * The one card for any article in the blog — mirrors `ResourceCard`'s
 * shape (src/components/patterns/resource-card.tsx) so the blog visually
 * belongs to the same site: a tinted icon tile (no real photography exists
 * for these articles, the same honest reasoning `ResourceCard` uses for a
 * type icon instead of a fake thumbnail), topic + audience badges, and a
 * real link to the article.
 */
function BlogArticleCard({ article, topicName }: BlogArticleCardProps) {
  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-surface-sunken px-6 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-100">
          <Newspaper className="size-5 text-secondary-700" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {new Date(article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          {article.featured && (
            <Badge variant="accent" className="mt-1">
              Featured
            </Badge>
          )}
        </div>
      </div>

      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          {topicName ?? article.topic}
        </Badge>
        <CardTitle className="mt-2">{article.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-neutral-600">{article.excerpt}</p>
        <div className="flex flex-wrap gap-2">
          {article.audience.map((audience) => (
            <Badge key={audience} variant="neutral">
              {BLOG_AUDIENCE_LABELS[audience]}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" asChild className="w-full">
          <Link href={`/blog/${article.slug}`}>Read article</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export { BlogArticleCard };
