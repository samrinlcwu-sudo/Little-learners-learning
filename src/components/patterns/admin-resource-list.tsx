"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Eye, FolderOpen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminResources } from "@/lib/resources/use-admin-resources";
import { useTeacherResources } from "@/lib/resources/use-teacher-resources";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import { buildAdminResourceRows, type AdminResourceSource } from "@/lib/resources/admin-resource-rows";
import { filterAdminResourceRows, type AdminResourceFilters } from "@/lib/resources/admin-resource-filters";
import { getAllResourceTypeOptions } from "@/config/teacher-resource-types";
import { getAllLearningCategories } from "@/config/learning-categories";
import { ACCESS_TIER_LABELS, RESOURCE_TYPE_LABELS, type AccessTier, type ResourceType } from "@/lib/resources/types";
import { PUBLICATION_STATUS_BADGE_VARIANT, PUBLICATION_STATUS_LABELS, type PublicationStatus } from "@/lib/content/types";

const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));

const SOURCE_LABELS: Record<AdminResourceSource, string> = {
  seed: "Platform library",
  admin: "Created here",
  teacher: "Teacher submission",
};

/**
 * The Admin Content Library (Prompt 67) — the first place an admin can see
 * every resource that exists across this browser: the checked-in sample
 * library (`seed`), resources created through this dashboard (`admin`,
 * real local CRUD — see local-admin-resources.ts), and resources a teacher
 * submitted from their own dashboard (`teacher`, reviewed per-teacher at
 * /admin/teachers/[teacherId]). Only `admin` rows can be edited or deleted
 * here — the other two are either checked-in demo data or someone else's
 * authored content. See docs/CONTENT_MANAGEMENT_ARCHITECTURE.md.
 */
function AdminResourceList() {
  const { resources: adminResources, ready: adminReady } = useAdminResources();
  const { resources: teacherResources, ready: teacherReady } = useTeacherResources();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [resourceType, setResourceType] = React.useState<ResourceType | "">("");
  const [status, setStatus] = React.useState<PublicationStatus | "">("");
  const [accessTier, setAccessTier] = React.useState<AccessTier | "">("");
  const [source, setSource] = React.useState<AdminResourceSource | "">("");

  const ready = adminReady && teacherReady;
  const rows = buildAdminResourceRows(SAMPLE_RESOURCES, adminResources, teacherResources);

  const filters: AdminResourceFilters = {
    query: query || undefined,
    category: category || undefined,
    resourceType: resourceType || undefined,
    status: status || undefined,
    accessTier: accessTier || undefined,
    source: source || undefined,
  };
  const hasActiveFilters = Boolean(query || category || resourceType || status || accessTier || source);
  const filtered = filterAdminResourceRows(rows, filters);

  function clearFilters() {
    setQuery("");
    setCategory("");
    setResourceType("");
    setStatus("");
    setAccessTier("");
    setSource("");
  }

  return (
    <>
      <Alert variant="info" className="mb-8">
        There&apos;s no shared backend yet, so resources created here save to <strong>this device</strong> only — the
        same limitation as teacher accounts and resources. Publishing here updates a resource&apos;s real status
        honestly; it doesn&apos;t yet make it appear on the public site for other visitors (see
        docs/CONTENT_MANAGEMENT_ARCHITECTURE.md).
      </Alert>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="sm:col-span-2 lg:col-span-1">
                <Label htmlFor="admin-resource-q">Search</Label>
                <Input
                  id="admin-resource-q"
                  type="search"
                  placeholder="Title, description…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="admin-resource-category">Category</Label>
                <Select id="admin-resource-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">All categories</option>
                  {getAllLearningCategories().map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-resource-type">Type</Label>
                <Select
                  id="admin-resource-type"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as ResourceType | "")}
                >
                  <option value="">All types</option>
                  {getAllResourceTypeOptions().map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-resource-status">Status</Label>
                <Select
                  id="admin-resource-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PublicationStatus | "")}
                >
                  <option value="">Any status</option>
                  {(Object.keys(PUBLICATION_STATUS_LABELS) as PublicationStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {PUBLICATION_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-resource-tier">Access</Label>
                <Select
                  id="admin-resource-tier"
                  value={accessTier}
                  onChange={(e) => setAccessTier(e.target.value as AccessTier | "")}
                >
                  <option value="">Free &amp; premium</option>
                  {(Object.keys(ACCESS_TIER_LABELS) as AccessTier[]).map((tier) => (
                    <option key={tier} value={tier}>
                      {ACCESS_TIER_LABELS[tier]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-resource-source">Source</Label>
                <Select
                  id="admin-resource-source"
                  value={source}
                  onChange={(e) => setSource(e.target.value as AdminResourceSource | "")}
                >
                  <option value="">Any source</option>
                  {(Object.keys(SOURCE_LABELS) as AdminResourceSource[]).map((s) => (
                    <option key={s} value={s}>
                      {SOURCE_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/content/new">
                <Plus aria-hidden="true" />
                New resource
              </Link>
            </Button>
          </div>

          {hasActiveFilters && (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}

          <div className="mt-8">
            {!ready ? null : filtered.length === 0 ? (
              <EmptyState
                icon={hasActiveFilters ? FolderOpen : BookOpen}
                title={hasActiveFilters ? "No resources match your filters" : "No resources yet"}
                description={
                  hasActiveFilters
                    ? "Try clearing a filter."
                    : "Create the first resource in the content library."
                }
                action={
                  hasActiveFilters ? (
                    <Button size="sm" variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : (
                    <Button size="sm" asChild>
                      <Link href="/admin/content/new">New resource</Link>
                    </Button>
                  )
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-200">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="border-b border-neutral-200 bg-surface-sunken text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Access</th>
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filtered.map(({ resource, source: rowSource }) => (
                      <tr key={resource.id}>
                        <td className="px-4 py-3 font-medium text-ink">{resource.title}</td>
                        <td className="px-4 py-3 text-neutral-600">{RESOURCE_TYPE_LABELS[resource.resourceType]}</td>
                        <td className="px-4 py-3 text-neutral-600">
                          {resource.category ? categoryNameBySlug.get(resource.category) ?? resource.category : resource.subject ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={PUBLICATION_STATUS_BADGE_VARIANT[resource.publicationStatus]}>
                            {PUBLICATION_STATUS_LABELS[resource.publicationStatus]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">{ACCESS_TIER_LABELS[resource.accessTier]}</td>
                        <td className="px-4 py-3">
                          <Badge variant="neutral">{SOURCE_LABELS[rowSource]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/content/${resource.id}`}>
                              <Eye aria-hidden="true" />
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
    </>
  );
}

export { AdminResourceList };
