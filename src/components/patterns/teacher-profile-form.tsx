"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { TEACHER_AGE_GROUP_OPTIONS, TEACHER_LANGUAGE_OPTIONS } from "@/config/teacher-options";
import { getAllLearningCategories } from "@/config/learning-categories";
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
  /** Shown instead of "Save profile" when this is the first-time completion step, with a matching "skip for now" escape hatch. */
  isFirstTime?: boolean;
  skipHref?: string;
}

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
function TeacherProfileForm({ teacher, onSave, isFirstTime, skipHref = "/teachers/dashboard" }: TeacherProfileFormProps) {
  const [photo, setPhoto] = React.useState<string | undefined>(teacher.photo);
  const [photoError, setPhotoError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherProfileInput, unknown, TeacherProfileValues>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      bio: teacher.bio ?? "",
      education: teacher.education ?? "",
      certifications: teacher.certifications ?? "",
      yearsExperience: teacher.yearsExperience,
      ageGroupsTaught: teacher.ageGroupsTaught,
      subjects: teacher.subjects,
      languages: teacher.languages,
      teachingInterests: teacher.teachingInterests ?? "",
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
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
      <section>
        <Heading level="h4" as="h2">
          Profile photo
        </Heading>
        <p className="mt-1 text-sm text-neutral-600">
          Optional. Stored on this device only for now — see below.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-400">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- a locally-read data URL, not a served/optimizable image
              <img src={photo} alt="" className="size-full object-cover" />
            ) : (
              <ImagePlus className="size-6" aria-hidden="true" />
            )}
          </div>
          <div>
            <Label htmlFor="teacher-photo" className="sr-only">
              Upload a profile photo
            </Label>
            <input
              id="teacher-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-neutral-100"
            />
            {photoError && <p className="mt-1.5 text-sm text-error-600">{photoError}</p>}
          </div>
        </div>
      </section>

      <section>
        <Heading level="h4" as="h2">
          Professional information
        </Heading>
        <div className="mt-4 space-y-4">
          <div>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="teacher-education">Education</Label>
              <Input
                id="teacher-education"
                placeholder="e.g. B.Ed. Early Childhood Education"
                invalid={!!errors.education}
                {...register("education")}
              />
              {errors.education && <p className="mt-1.5 text-sm text-error-600">{errors.education.message}</p>}
            </div>
            <div>
              <Label htmlFor="teacher-experience">Years of experience</Label>
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
          </div>

          <div>
            <Label htmlFor="teacher-certifications">Certifications</Label>
            <Textarea
              id="teacher-certifications"
              placeholder="Any teaching certifications or qualifications, one per line."
              invalid={!!errors.certifications}
              {...register("certifications")}
            />
            {errors.certifications && (
              <p className="mt-1.5 text-sm text-error-600">{errors.certifications.message}</p>
            )}
          </div>
        </div>
      </section>

      <section>
        <Heading level="h4" as="h2">
          Teaching expertise
        </Heading>
        <div className="mt-4 space-y-6">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-ink">Age groups taught</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TEACHER_AGE_GROUP_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-md border border-neutral-300 px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors",
                    "has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-800",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-600/30",
                  )}
                >
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
                <label
                  key={category.slug}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-md border border-neutral-300 px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors",
                    "has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-800",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-600/30",
                  )}
                >
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
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-md border border-neutral-300 px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors",
                    "has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-800",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-600/30",
                  )}
                >
                  <input type="checkbox" value={option.id} className="sr-only" {...register("languages")} />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

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
        {isFirstTime && (
          <Button type="button" variant="ghost" asChild>
            <Link href={skipHref}>Skip for now</Link>
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {isFirstTime ? "Save and continue" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export { TeacherProfileForm };
