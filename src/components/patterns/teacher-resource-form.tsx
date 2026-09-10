"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getAllTeacherResourceTypeOptions } from "@/config/teacher-resource-types";
import { getAllLearningCategories } from "@/config/learning-categories";
import {
  teacherResourceSchema,
  type TeacherResourceInput,
  type TeacherResourceValues,
} from "@/lib/validations/teacher-resource";
import type { NewTeacherResource } from "@/lib/resources/local-teacher-resources";
import type { Resource, ResourceType } from "@/lib/resources/types";

const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;

const DIFFICULTY_OPTIONS: { id: TeacherResourceValues["difficulty"]; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export interface TeacherResourceFormProps {
  /** Present when editing an existing resource — absent when creating a new one. */
  resource?: Resource;
  onSave: (values: NewTeacherResource, status: "draft" | "published") => void;
  onCancel: () => void;
}

/**
 * Creates or edits one of this teacher's own resources
 * (src/lib/resources/local-teacher-resources.ts) — real fields on the same
 * `Resource` shape the whole site already uses, not a parallel model.
 * There is deliberately no file/download field: no real file storage
 * exists anywhere in this codebase, so this form never offers an upload
 * that couldn't actually work. "Submit for review" sets
 * `publicationStatus: "published"` with `reviewStatus: "pending"` — see
 * docs/TEACHER_ARCHITECTURE.md for why that can never yet become visible
 * anywhere, and why that's the honest behavior rather than a bug.
 */
function TeacherResourceForm({ resource, onSave, onCancel }: TeacherResourceFormProps) {
  const [thumbnail, setThumbnail] = React.useState<string | undefined>(resource?.thumbnail);
  const [thumbnailError, setThumbnailError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherResourceInput, unknown, TeacherResourceValues>({
    resolver: zodResolver(teacherResourceSchema),
    defaultValues: resource
      ? {
          title: resource.title,
          description: resource.description,
          resourceType: resource.resourceType,
          category: resource.category ?? "",
          minAge: resource.ageRange.minYears,
          maxAge: resource.ageRange.maxYears,
          difficulty: resource.difficulty,
          learningObjective: resource.learningObjective,
        }
      : { difficulty: "beginner" },
  });

  function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setThumbnailError(null);

    if (!file.type.startsWith("image/")) {
      setThumbnailError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      setThumbnailError("Image must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setThumbnail(reader.result as string);
    reader.onerror = () => setThumbnailError("Couldn't read that image — try another file.");
    reader.readAsDataURL(file);
  }

  function onSubmit(values: TeacherResourceValues, status: "draft" | "published") {
    onSave(
      {
        title: values.title,
        description: values.description,
        resourceType: values.resourceType as ResourceType,
        category: values.category,
        ageRange: { minYears: values.minAge, maxYears: values.maxAge },
        difficulty: values.difficulty,
        learningObjective: values.learningObjective,
        thumbnail,
      },
      status,
    );
  }

  return (
    <form className="space-y-5" noValidate>
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
          <Select id="resource-type" invalid={!!errors.resourceType} {...register("resourceType")}>
            <option value="">Choose a type</option>
            {getAllTeacherResourceTypeOptions().map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
          {errors.resourceType && <p className="mt-1.5 text-sm text-error-600">{errors.resourceType.message}</p>}
        </div>

        <div>
          <Label htmlFor="resource-category">Subject (optional)</Label>
          <Select id="resource-category" invalid={!!errors.category} {...register("category")}>
            <option value="">No specific subject</option>
            {getAllLearningCategories().map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="resource-min-age">Age from</Label>
          <Input
            id="resource-min-age"
            type="number"
            min={2}
            max={8}
            inputMode="numeric"
            invalid={!!errors.minAge}
            {...register("minAge")}
          />
          {errors.minAge && <p className="mt-1.5 text-sm text-error-600">{errors.minAge.message}</p>}
        </div>
        <div>
          <Label htmlFor="resource-max-age">Age to</Label>
          <Input
            id="resource-max-age"
            type="number"
            min={2}
            max={8}
            inputMode="numeric"
            invalid={!!errors.maxAge}
            {...register("maxAge")}
          />
          {errors.maxAge && <p className="mt-1.5 text-sm text-error-600">{errors.maxAge.message}</p>}
        </div>
        <div>
          <Label htmlFor="resource-difficulty">Difficulty</Label>
          <Select id="resource-difficulty" invalid={!!errors.difficulty} {...register("difficulty")}>
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
        {errors.learningObjective && (
          <p className="mt-1.5 text-sm text-error-600">{errors.learningObjective.message}</p>
        )}
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
        <div>
          <Label htmlFor="resource-thumbnail">Thumbnail (optional)</Label>
          <input
            id="resource-thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-neutral-100"
          />
          {thumbnailError && <p className="mt-1.5 text-sm text-error-600">{thumbnailError}</p>}
          <p className="mt-1 text-xs text-neutral-500">Stored on this device only for now.</p>
        </div>
      </div>

      <p className="rounded-md bg-neutral-100 px-3.5 py-2.5 text-xs text-neutral-600">
        There&apos;s no file upload yet — a resource created here has no attached worksheet or ebook
        file, the same as every sample resource on the platform today.
      </p>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-neutral-200 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
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
          onClick={handleSubmit((values) => onSubmit(values, "published"))}
        >
          Submit for review
        </Button>
      </div>
    </form>
  );
}

export { TeacherResourceForm };
