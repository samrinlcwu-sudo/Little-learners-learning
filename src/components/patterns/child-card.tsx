import Link from "next/link";
import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChildAvatar } from "@/components/patterns/child-avatar";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import type { ChildProfile } from "@/lib/accounts/types";

export interface ChildCardProps {
  child: ChildProfile;
  onEdit: (child: ChildProfile) => void;
}

function ChildCard({ child, onEdit }: ChildCardProps) {
  const favorite = child.favoriteCategory ? getLearningCategoryBySlug(child.favoriteCategory) : undefined;

  return (
    <Card className="flex flex-col items-center gap-3 p-5 text-center">
      <ChildAvatar avatar={child.avatar} size="lg" />
      <div>
        <p className="font-display text-lg font-semibold text-ink">{child.name}</p>
        <p className="text-sm text-neutral-600">
          {child.ageYears} year{child.ageYears === 1 ? "" : "s"} old
        </p>
        {favorite && <p className="mt-0.5 text-xs text-neutral-500">Loves {favorite.name}</p>}
      </div>
      <div className="mt-1 flex w-full gap-2">
        <Button size="sm" asChild className="flex-1">
          <Link href={`/dashboard/children/${child.id}`}>View</Link>
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(child)} aria-label={`Edit ${child.name}'s profile`}>
          <Pencil aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}

export { ChildCard };
