"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { RESOURCE_TYPE_LABELS, type Resource } from "@/lib/resources/types";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

export interface TeacherResourceListProps {
  resources: Resource[];
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}

type StatusDisplay = { label: string; variant: "neutral" | "success" | "error" };

/** The real, current lifecycle state of one resource — never a fabricated "reviewed" state, since no reviewer exists yet. */
function statusDisplay(resource: Resource): StatusDisplay {
  if (resource.publicationStatus === "draft") {
    return { label: "Draft", variant: "neutral" };
  }
  if (resource.reviewStatus === "approved") {
    return { label: "Published", variant: "success" };
  }
  if (resource.reviewStatus === "rejected") {
    return { label: "Not approved", variant: "error" };
  }
  return { label: "Submitted — awaiting review", variant: "neutral" };
}

/**
 * A teacher's own resources, in the compact table shape a management view
 * needs (title/category/type/status/date/actions) — deliberately not the
 * ResourceCard grid used for browsing, since editing your own list and
 * discovering the library are different tasks. Every value shown is real:
 * no resource here has ever actually been reviewed, so the status column
 * never claims otherwise (see docs/TEACHER_ARCHITECTURE.md).
 */
function TeacherResourceList({ resources, onEdit, onDelete }: TeacherResourceListProps) {
  if (resources.length === 0) {
    return (
      <EmptyState
        title="No resources yet"
        description="Create your first resource to see it listed here."
      />
    );
  }

  const sorted = [...resources].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-neutral-200 bg-surface-sunken text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {sorted.map((resource) => {
            const status = statusDisplay(resource);
            const category = resource.category ? getLearningCategoryBySlug(resource.category) : undefined;
            return (
              <tr key={resource.id}>
                <td className="px-4 py-3 font-medium text-ink">{resource.title}</td>
                <td className="px-4 py-3 text-neutral-600">{category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-600">{RESOURCE_TYPE_LABELS[resource.resourceType]}</td>
                <td className="px-4 py-3">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="px-4 py-3 text-neutral-500">{formatRelativeTime(resource.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(resource)}
                      aria-label={`Edit ${resource.title}`}
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(resource)}
                      aria-label={`Delete ${resource.title}`}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { TeacherResourceList };
