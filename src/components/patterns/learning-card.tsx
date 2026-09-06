import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTENT_TYPE_LABELS, type LearningContent } from "@/lib/content/types";

export interface LearningCardProps {
  content: LearningContent;
  categoryName: string;
  /** Every card today renders from SAMPLE_CONTENT — keep this true until a real content pipeline exists. */
  isSample: boolean;
}

const DIFFICULTY_LABELS: Record<LearningContent["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/**
 * The one card shape for any learning resource, anywhere it's listed (the
 * hub, a category page, a future "featured" row) — title, category, age,
 * content type, difficulty, and an action, per the design brief.
 */
function LearningCard({ content, categoryName, isSample }: LearningCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <Badge variant="primary">{categoryName}</Badge>
          <CardTitle className="mt-3">{content.title}</CardTitle>
        </div>
        {isSample && <Badge variant="warning">Sample</Badge>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-neutral-600">{content.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">
            Ages {content.ageRange.minYears}–{content.ageRange.maxYears}
          </Badge>
          <Badge variant="neutral">{CONTENT_TYPE_LABELS[content.contentType]}</Badge>
          <Badge variant="neutral">{DIFFICULTY_LABELS[content.difficulty]}</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline" disabled title="Coming soon" className="w-full">
          {isSample ? "Preview — coming soon" : "View"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export { LearningCard };
