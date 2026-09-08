"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Eye, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import { TEACHER_AGE_GROUP_OPTIONS, TEACHER_LANGUAGE_OPTIONS } from "@/config/teacher-options";
import { getAllLearningCategories } from "@/config/learning-categories";
import { TeacherProfilePreviewModal } from "@/components/patterns/teacher-profile-preview-modal";
import {
  teacherProfileSchema,
  type TeacherProfileInput,
  type TeacherProfileValues,
} from "@/lib/validations/teacher";
import type { TeacherProfile } from "@/lib/accounts/types";
import { cn } from "@/lib/utils/cn";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export interface TeacherProfileFormProps {
  teacher: TeacherProfile;
  onSave: (values: TeacherProfileValues & { photo?: string }) => void;
  /** First-time completion (right after registration) gets "Skip for now" + a redirect on save; every later edit gets Cancel + an inline "saved" confirmation instead. */
  isFirstTime?: boolean;
  skipHref?: string;
  onCancel?: () => void;
}

const checkboxLabelClass = cn(
  "flex cursor-pointer items-center justify-center rounded-md border border-neutral-300 px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors",
  "has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-800",
  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-600/30",
);

/**
 * Step 2 (and every later edit): every field is optional, saved to this
 * browser's local teacher record (src/lib/accounts/local-teacher.ts) —
 * real and working, same as ChildProfileForm, because a teacher typing
 * their own bio and subjects isn't the same problem as authenticating a
 * user. The photo is handled outside react-hook-form (file inputs can't be
 * bound like text fields) and stored as a data URL — see
 * docs/TEACHER_ARCHITECTURE.md for why that's safe without a real storage
 * backend.
 */
function TeacherProfileForm({ teacher, onSave, isFirstTime, skipHref = "/teachers/dashboard", onCancel }: TeacherProfileFormProps) {
  const [photo, setPhoto] = React.useState<string | undefined>(teacher.photo);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<TeacherProfileInput, unknown, TeacherProfileValues>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      headline: teacher.headline ?? "",
      bio: teacher.bio ?? "",
      education: teacher.education ?? "",
      certifications: teacher.certifications ?? "",
      yearsExperience: teacher.yearsExperience,
      ageGroupsTaught: teacher.ageGroupsTaught,
      subjects: teacher.subjects,
      languages: teacher.languages,
      teachingInterests: teacher.teachingInterests ?? "",
      expertise: teacher.expertise.join(", "),
    },
  });

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError(null);

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Image must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.onerror = () => setPhotoError("Couldn't read that image — try another file.");
    reader.readAsDataURL(file);
  }

  function onSubmit(values: TeacherProfileValues) {
    onSave({ ...values, photo });
    if (!isFirstTime) setJustSaved(true);
  }

  /** Reuses the real validation/transform pipeline so the preview can never diverge from what Save would actually produce. */
  function buildPreviewTeacher(): TeacherProfile {
    const parsed = teacherProfileSchema.safeParse(getValues());
    return { ...teacher, ...(parsed.success ? parsed.data : {}), photo };
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => setJustSaved(false)}
      className="space-y-10"
      noValidate
    >
      {justSaved && (
        <Alert variant="success" className="flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
          <span>Profile updated.</span>
        </Alert>
      )}

      <section>
        <Heading level="h4" as="h2">
          Identity
        </Heading>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-400">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- a locally-read data URL, not a served/optimizable image
                <img src={photo} alt="" className="size-full object-cover" />
              ) : (
                <ImagePlus className="size-6" aria-hidden="true" />
              )}
            </div>
            <div>
              <Label htmlFor="teacher-photo">Profile photo</Label>
              <input
                id="teacher-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-neutral-100"
              />
              {photoError && <p className="mt-1.5 text-sm text-error-600">{photoError}</p>}
              <p className="mt-1 text-xs text-neutral-500">Optional. Stored on this device only for now.</p>
            </div>
          </div>

          <div>
            <Label htmlFor="teacher-headline">Professional headline</Label>
            <Input
              id="teacher-headline"
              placeholder="e.g. Early Years Teacher | Montessori Certified"
              invalid={!!errors.headline}
              {...register("headline")}
            />
            {errors.headline && <p className="mt-1.5 text-sm text-error-600">{errors.headline.message}</p>}
          </div>
        </div>
      </section>

      <section>
        <Heading level="h4" as="h2">
          About
        </Heading>
        <div className="mt-4">
          <Label htmlFor="teacher-bio">Professional bio</Label>
          <Textarea
            id="teacher-bio"
            placeholder="A short introduction — your teaching background and what you're passionate about."
            invalid={!!errors.bio}
            aria-describedby={errors.bio ? "teacher-bio-error" : undefined}
            {...register("bio")}
          />
          {errors.bio && (
            <p id="teacher-bio-error" className="mt-1.5 text-sm text-error-600">
              {errors.bio.message}
            </p>
          )}
        </div>
      </section>

      <section>
        <Heading level="h4" as="h2">
          Education
        </Heading>
        <div className="mt-4">
          <Label htmlFor="teacher-education">Degrees, diplomas, or relevant education</Label>
          <Textarea
            id="teacher-education"
            placeholder="e.g. B.Ed. Early Childhood Education, one per line"
            invalid={!!errors.education}
            {...register("education")}
          />
          {errors.education && <p className="mt-1.5 text-sm text-error-600">{errors.education.message}</p>}
        </div>
      </section>

      <section>
        <Heading level="h4" as="h2">
          Certifications
        </Heading>
        <div className="mt-4">
          <Label htmlFor="teacher-certifications">Certifications, teacher training, or workshops</Label>
          <Textarea
            id="teacher-certifications"
            placeholder="e.g. Montessori Certification, one per line"
            invalid={!!errors.certifications}
            {...register("certifications")}
          />
          {errors.certifications && (
            <p className="mt-1.5 text-sm text-error-600">{errors.certifications.message}</p>
          )}
        </div>
      </section>

      <section>
        <Heading level="h4" as="h2">
          Experience
        </Heading>
        <div className="mt-4 max-w-xs">
          <Label htmlFor="teacher-experience">Years of teaching experience</Label>
          <Input
            id="teacher-experience"
            type="number"
            min={0}
            max={60}
            inputMode="numeric"
            invalid={!!errors.yearsExperience}
            {...register("yearsExperience")}
          />
          {errors.yearsExperience && (
            <p className="mt-1.5 text-sm text-error-600">{errors.yearsExperience.message}</p>
          )}
        </div>
      </section>

      <section>
        <Heading level="h4" as="h2">
          Teaching
        </Heading>
        <div className="mt-4 space-y-6">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-ink">Age groups</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TEACHER_AGE_GROUP_OPTIONS.map((option) => (
                <label key={option.id} className={checkboxLabelClass}>
                  <input type="checkbox" value={option.id} className="sr-only" {...register("ageGroupsTaught")} />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-ink">Subjects / learning areas</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {getAllLearningCategories().map((category) => (
                <label key={category.slug} className={checkboxLabelClass}>
                  <input type="checkbox" value={category.slug} className="sr-only" {...register("subjects")} />
                  {category.name}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-ink">Languages</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TEACHER_LANGUAGE_OPTIONS.map((option) => (
                <label key={option.id} className={checkboxLabelClass}>
                  <input type="checkbox" value={option.id} className="sr-only" {...register("languages")} />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <Label htmlFor="teacher-expertise">Areas of expertise</Label>
            <Input
              id="teacher-expertise"
              placeholder="e.g. Special needs support, Bilingual education"
              invalid={!!errors.expertise}
              {...register("expertise")}
            />
            <p className="mt-1 text-xs text-neutral-500">Separate each one with a comma.</p>
          </div>

          <div>
            <Label htmlFor="teacher-interests">Teaching interests</Label>
            <Textarea
              id="teacher-interests"
              placeholder="What kinds of topics, projects, or teaching styles are you drawn to?"
              invalid={!!errors.teachingInterests}
              {...register("teachingInterests")}
            />
            {errors.teachingInterests && (
              <p className="mt-1.5 text-sm text-error-600">{errors.teachingInterests.message}</p>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-neutral-200 pt-6">
        {isFirstTime ? (
          <Button type="button" variant="ghost" asChild>
            <Link href={skipHref}>Skip for now</Link>
          </Button>
        ) : (
          onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )
        )}
        <Button type="button" variant="soft" onClick={() => setPreviewOpen(true)}>
          <Eye aria-hidden="true" />
          Preview
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isFirstTime ? "Save and continue" : "Save changes"}
        </Button>
      </div>

      {previewOpen && (
        <TeacherProfilePreviewModal open={previewOpen} onOpenChange={setPreviewOpen} teacher={buildPreviewTeacher()} />
      )}
    </form>
  );
}

export { TeacherProfileForm };
