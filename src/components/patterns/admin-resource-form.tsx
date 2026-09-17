"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, FileUp, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { getAllResourceTypeOptions } from "@/config/teacher-resource-types";
import { getAllLearningCategories } from "@/config/learning-categories";
import { validateUploadedFile } from "@/lib/utils/file-validation";
import { adminResourceSchema, type AdminResourceInput, type AdminResourceValues } from "@/lib/validations/admin-resource";
import type { NewAdminResource } from "@/lib/resources/local-admin-resources";
import type { ActivitySubtype, AccessTier, Resource, ResourceType } from "@/lib/resources/types";
import { ACCESS_TIER_LABELS, ACTIVITY_SUBTYPE_LABELS } from "@/lib/resources/types";

const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const DIFFICULTY_OPTIONS: { id: AdminResourceValues["difficulty"]; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export interface AdminResourceFormProps {
  /** Present when editing an existing admin-created resource — absent when creating a new one. */
  resource?: Resource;
  /**
   * `status` is only ever "draft"/"review" on a brand-new resource (which
   * of the two Save buttons was pressed). When editing an existing one it's
   * always `undefined` — editing content fields never changes publication
   * status; only a confirmed action on the detail page does that.
   */
  onSave: (values: NewAdminResource, status?: "draft" | "review") => void;
  onCancel: () => void;
}

/**
 * Creates or edits one resource in the Admin Content Library
 * (src/lib/resources/local-admin-resources.ts) — real fields on the same
 * `Resource` shape every other resource in this codebase already uses.
 * Deliberately never offers a "Publish" action: saving here only ever
 * produces "draft" or "review" — moving something live is a separate,
 * confirmed action on the resource's detail page (see
 * admin-resource-detail.tsx and docs/CONTENT_MANAGEMENT_ARCHITECTURE.md,
 * "publishing must be deliberate").
 */
function AdminResourceForm({ resource, onSave, onCancel }: AdminResourceFormProps) {
  const [thumbnail, setThumbnail] = React.useState<string | undefined>(resource?.thumbnail);
  const [thumbnailError, setThumbnailError] = React.useState<string | null>(null);
  const [downloadFile, setDownloadFile] = React.useState<string | undefined>(resource?.downloadFile);
  const [downloadFileName, setDownloadFileName] = React.useState<string | undefined>(
    resource?.downloadFile ? "Attached file" : undefined,
  );
  const [fileError, setFileError] = React.useState<string | null>(null);
  // Mirrors the resourceType field into plain state (rather than
  // react-hook-form's `watch()`, which the React Compiler can't safely
  // memoize) purely to toggle the two type-conditional fields below.
  const [resourceType, setResourceType] = React.useState<ResourceType | undefined>(resource?.resourceType);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminResourceInput, unknown, AdminResourceValues>({
    resolver: zodResolver(adminResourceSchema),
    defaultValues: resource
      ? {
          title: resource.title,
          description: resource.description,
          resourceType: resource.resourceType,
          activitySubtype: resource.activitySubtype ?? "",
          category: resource.category ?? "",
          subcategory: resource.subcategory ?? "",
          subject: resource.subject ?? "",
          minAge: resource.ageRange.minYears,
          maxAge: resource.ageRange.maxYears,
          difficulty: resource.difficulty,
          learningObjective: resource.learningObjective,
          learningObjectivesText: (resource.learningObjectives ?? []).join("\n"),
          skillsDevelopedText: (resource.skillsDeveloped ?? []).join("\n"),
          pageCount: resource.pageCount,
          instructionsText: (resource.instructions ?? []).join("\n"),
          materialsRequiredText: (resource.materialsRequired ?? []).join("\n"),
          tagsText: resource.tags.join(", "),
          accessTier: resource.accessTier,
          featured: resource.featured,
          seoTitle: resource.seoTitle ?? "",
          metaDescription: resource.metaDescription ?? "",
          canonicalUrl: resource.canonicalUrl ?? "",
        }
      : { difficulty: "beginner", accessTier: "free", featured: false },
  });

  const showsActivitySubtype = resourceType === "worksheet" || resourceType === "activity";
  const showsPageCount = resourceType === "ebook";

  function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setThumbnailError(null);

    const error = validateUploadedFile(file, {
      acceptedTypePrefixes: ["image/"],
      maxBytes: MAX_THUMBNAIL_BYTES,
      typeDescription: "an image",
    });
    if (error) {
      setThumbnailError(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setThumbnail(reader.result as string);
    reader.onerror = () => setThumbnailError("Couldn't read that image — try another file.");
    reader.readAsDataURL(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError(null);

    const error = validateUploadedFile(file, {
      acceptedTypePrefixes: ["application/pdf"],
      maxBytes: MAX_FILE_BYTES,
      typeDescription: "a PDF",
    });
    if (error) {
      setFileError(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDownloadFile(reader.result as string);
      setDownloadFileName(file.name);
    };
    reader.onerror = () => setFileError("Couldn't read that file — try another one.");
    reader.readAsDataURL(file);
  }

  function removeFile() {
    setDownloadFile(undefined);
    setDownloadFileName(undefined);
    setFileError(null);
  }

  function onSubmit(values: AdminResourceValues, status?: "draft" | "review") {
    onSave(
      {
        title: values.title,
        description: values.description,
        resourceType: values.resourceType as ResourceType,
        activitySubtype: values.activitySubtype as ActivitySubtype | undefined,
        category: values.category,
        subcategory: values.subcategory || undefined,
        subject: values.subject || undefined,
        ageRange: { minYears: values.minAge, maxYears: values.maxAge },
        difficulty: values.difficulty,
        learningObjective: values.learningObjective,
        learningObjectives: values.learningObjectivesText.length > 0 ? values.learningObjectivesText : undefined,
        skillsDeveloped: values.skillsDevelopedText.length > 0 ? values.skillsDevelopedText : undefined,
        pageCount: values.pageCount,
        instructions: values.instructionsText.length > 0 ? values.instructionsText : undefined,
        materialsRequired: values.materialsRequiredText.length > 0 ? values.materialsRequiredText : undefined,
        tags: values.tagsText,
        thumbnail,
        downloadFile,
        accessTier: values.accessTier as AccessTier,
        featured: values.featured,
        seoTitle: values.seoTitle || undefined,
        metaDescription: values.metaDescription || undefined,
        canonicalUrl: values.canonicalUrl || undefined,
      },
      status,
    );
  }

  return (
    <form className="space-y-10" noValidate>
      <section>
        <Heading level="h4" as="h2">
          Basics
        </Heading>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="resource-title">Title</Label>
            <Input id="resource-title" invalid={!!errors.title} {...register("title")} />
            {errors.title && <p className="mt-1.5 text-sm text-error-600">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="resource-description">Description</Label>
            <Textarea id="resource-description" invalid={!!errors.description} {...register("description")} />
            {errors.description && <p className="mt-1.5 text-sm text-error-600">{errors.description.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="resource-type">Resource type</Label>
              <Select
                id="resource-type"
                invalid={!!errors.resourceType}
                {...register("resourceType", { onChange: (e) => setResourceType(e.target.value as ResourceType) })}
              >
                <option value="">Choose a type</option>
                {getAllResourceTypeOptions().map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.resourceType && <p className="mt-1.5 text-sm text-error-600">{errors.resourceType.message}</p>}
            </div>
            {showsActivitySubtype && (
              <div>
                <Label htmlFor="resource-activity-subtype">Activity subtype (optional)</Label>
                <Select id="resource-activity-subtype" {...register("activitySubtype")}>
                  <option value="">No specific subtype</option>
                  {(Object.keys(ACTIVITY_SUBTYPE_LABELS) as (keyof typeof ACTIVITY_SUBTYPE_LABELS)[]).map((id) => (
                    <option key={id} value={id}>
                      {ACTIVITY_SUBTYPE_LABELS[id]}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="resource-category">Learning category (optional)</Label>
              <Select id="resource-category" {...register("category")}>
                <option value="">No specific category</option>
                {getAllLearningCategories().map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="resource-subject">Subject label (optional)</Label>
              <Input
                id="resource-subject"
                placeholder="e.g. Classroom Management"
                {...register("subject")}
              />
              <p className="mt-1 text-xs text-neutral-500">
                For resources that don&apos;t map to a learning category — e.g. a teacher or parent resource.
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="resource-subcategory">Subcategory (optional)</Label>
            <Input id="resource-subcategory" {...register("subcategory")} />
          </div>
        </div>
      </section>

      <section>
        <Heading level="h4" as="h2">
          Learning details
        </Heading>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="resource-min-age">Age from</Label>
              <Input id="resource-min-age" type="number" min={0} max={12} inputMode="numeric" invalid={!!errors.minAge} {...register("minAge")} />
              {errors.minAge && <p className="mt-1.5 text-sm text-error-600">{errors.minAge.message}</p>}
            </div>
            <div>
              <Label htmlFor="resource-max-age">Age to</Label>
              <Input id="resource-max-age" type="number" min={0} max={12} inputMode="numeric" invalid={!!errors.maxAge} {...register("maxAge")} />
              {errors.maxAge && <p className="mt-1.5 text-sm text-error-600">{errors.maxAge.message}</p>}
            </div>
            <div>
              <Label htmlFor="resource-difficulty">Difficulty</Label>
              <Select id="resource-difficulty" {...register("difficulty")}>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="resource-objective">Learning objective</Label>
            <Input
              id="resource-objective"
              placeholder="What will a child be able to do after this?"
              invalid={!!errors.learningObjective}
              {...register("learningObjective")}
            />
            {errors.learningObjective && <p className="mt-1.5 text-sm text-error-600">{errors.learningObjective.message}</p>}
          </div>
          <div>
            <Label htmlFor="resource-objectives">Additional objectives (optional, one per line)</Label>
            <Textarea id="resource-objectives" rows={3} {...register("learningObjectivesText")} />
            <p className="mt-1 text-xs text-neutral-500">
              Shown instead of the single objective above when a resource covers more than one goal.
            </p>
          </div>
          <div>
            <Label htmlFor="resource-skills">Skills developed (optional, one per line)</Label>
            <Textarea id="resource-skills" rows={3} {...register("skillsDevelopedText")} />
          </div>
          {showsPageCount && (
            <div className="max-w-[200px]">
              <Label htmlFor="resource-page-count">Page count</Label>
              <Input id="resource-page-count" type="number" min={1} max={500} inputMode="numeric" {...register("pageCount")} />
            </div>
          )}
          <div>
            <Label htmlFor="resource-materials">Materials required (optional, one per line)</Label>
            <Textarea id="resource-materials" rows={3} {...register("materialsRequiredText")} />
          </div>
          <div>
            <Label htmlFor="resource-instructions">Instructions / steps (optional, one per line)</Label>
            <Textarea id="resource-instructions" rows={4} {...register("instructionsText")} />
          </div>
          <div>
            <Label htmlFor="resource-tags">Tags (optional, comma-separated)</Label>
            <Input id="resource-tags" placeholder="counting, numbers" {...register("tagsText")} />
          </div>
        </div>
      </section>

      <section>
        <Heading level="h4" as="h2">
          Access &amp; media
        </Heading>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="resource-tier">Access</Label>
              <Select id="resource-tier" {...register("accessTier")}>
                {(Object.keys(ACCESS_TIER_LABELS) as AccessTier[]).map((tier) => (
                  <option key={tier} value={tier}>
                    {ACCESS_TIER_LABELS[tier]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  className="size-4 rounded border-neutral-300 text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600/30"
                  {...register("featured")}
                />
                Feature this resource
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-400">
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element -- a locally-read data URL, not a served/optimizable image
                <img src={thumbnail} alt="" className="size-full object-cover" />
              ) : (
                <ImagePlus className="size-6" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Label htmlFor="resource-thumbnail">Thumbnail (optional)</Label>
              <input
                id="resource-thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="w-full max-w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-neutral-100"
              />
              {thumbnailError && <p className="mt-1.5 text-sm text-error-600">{thumbnailError}</p>}
              <p className="mt-1 text-xs text-neutral-500">Image files only, up to 2MB. Stored on this device only for now.</p>
            </div>
          </div>

          <div>
            <Label htmlFor="resource-file">Downloadable file (optional)</Label>
            {downloadFileName ? (
              <div className="mt-1 flex items-center gap-2 rounded-md border border-neutral-300 bg-surface px-3.5 py-2.5 text-sm text-ink">
                <FileUp className="size-4 shrink-0 text-neutral-500" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{downloadFileName}</span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="rounded p-0.5 text-neutral-500 hover:bg-neutral-100 hover:text-ink"
                  aria-label="Remove attached file"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <input
                id="resource-file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-neutral-100"
              />
            )}
            {fileError && <p className="mt-1.5 text-sm text-error-600">{fileError}</p>}
            <p className="mt-1 text-xs text-neutral-500">
              PDF only, up to 5MB. Stored on this device only — a resource only ever shows a working download
              action once it&apos;s free, published, and has a file attached (see `canDownload`).
            </p>
          </div>
        </div>
      </section>

      <section>
        <Heading level="h4" as="h2">
          Search &amp; SEO (optional)
        </Heading>
        <p className="mt-1 text-sm text-neutral-600">
          Every field below already has a working default — the resource&apos;s own title, description, and URL.
          Only fill these in to deliberately override one of them.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="resource-seo-title">SEO title override</Label>
            <Input id="resource-seo-title" invalid={!!errors.seoTitle} {...register("seoTitle")} />
            {errors.seoTitle && <p className="mt-1.5 text-sm text-error-600">{errors.seoTitle.message}</p>}
          </div>
          <div>
            <Label htmlFor="resource-meta-description">Meta description override</Label>
            <Textarea id="resource-meta-description" invalid={!!errors.metaDescription} {...register("metaDescription")} />
            {errors.metaDescription && <p className="mt-1.5 text-sm text-error-600">{errors.metaDescription.message}</p>}
          </div>
          <div>
            <Label htmlFor="resource-canonical">Canonical URL override</Label>
            <Input id="resource-canonical" type="url" placeholder="https://" invalid={!!errors.canonicalUrl} {...register("canonicalUrl")} />
            {errors.canonicalUrl && <p className="mt-1.5 text-sm text-error-600">{errors.canonicalUrl.message}</p>}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-neutral-200 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {resource ? (
          <Button type="button" isLoading={isSubmitting} onClick={handleSubmit((values) => onSubmit(values))}>
            Save changes
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="soft"
              isLoading={isSubmitting}
              onClick={handleSubmit((values) => onSubmit(values, "draft"))}
            >
              Save as draft
            </Button>
            <Button
              type="button"
              isLoading={isSubmitting}
              onClick={handleSubmit((values) => onSubmit(values, "review"))}
            >
              Save &amp; send to review
            </Button>
          </>
        )}
      </div>
    </form>
  );
}

export { AdminResourceForm };
