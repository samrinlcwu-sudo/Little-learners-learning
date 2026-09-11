"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getAllLearningCategories } from "@/config/learning-categories";
import { applicationSchema, type ApplicationInput, type ApplicationValues } from "@/lib/validations/application";
import type { Application } from "@/lib/admissions/types";
import type { NewApplication } from "@/lib/admissions/local-applications";
import type { ChildProfile } from "@/lib/accounts/types";
import { cn } from "@/lib/utils/cn";

const checkboxLabelClass = cn(
  "flex cursor-pointer items-center justify-center rounded-md border border-neutral-300 px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors",
  "has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-800",
  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-600/30",
);

export interface ApplicationFormProps {
  /** This family's own real children — the only ones ever offered. */
  childProfiles: ChildProfile[];
  /** Present when editing an existing draft — absent when starting a new one. */
  application?: Application;
  onSave: (values: NewApplication) => void;
  onCancel: () => void;
}

/**
 * Starts or edits one of this family's own draft applications
 * (src/lib/admissions/local-applications.ts). `childId` only ever offers
 * this family's real children (never a free-text name — a real learner
 * has a real profile already), and "learning interests" reuses the exact
 * 16 real subjects every other part of the site already uses — no
 * separate "program" list exists to choose from, since none has been
 * invented. See docs/ADMISSIONS_ARCHITECTURE.md.
 */
function ApplicationForm({ childProfiles, application, onSave, onCancel }: ApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput, unknown, ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: application
      ? {
          childId: application.childId,
          learningInterests: application.learningInterests,
          message: application.message ?? "",
        }
      : { childId: childProfiles[0]?.id ?? "", learningInterests: [] },
  });

  function onSubmit(values: ApplicationValues) {
    onSave({ childId: values.childId, learningInterests: values.learningInterests, message: values.message });
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="application-child">Child</Label>
        <Select id="application-child" invalid={!!errors.childId} {...register("childId")}>
          {childProfiles.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name} ({child.ageYears} years old)
            </option>
          ))}
        </Select>
        {errors.childId && <p className="mt-1.5 text-sm text-error-600">{errors.childId.message}</p>}
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink">Learning interests</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {getAllLearningCategories().map((category) => (
            <label key={category.slug} className={checkboxLabelClass}>
              <input type="checkbox" value={category.slug} className="sr-only" {...register("learningInterests")} />
              {category.name}
            </label>
          ))}
        </div>
        {errors.learningInterests && (
          <p className="mt-1.5 text-sm text-error-600">{errors.learningInterests.message}</p>
        )}
      </fieldset>

      <div>
        <Label htmlFor="application-message">Anything else you&apos;d like to share (optional)</Label>
        <Textarea
          id="application-message"
          rows={4}
          placeholder="Questions, scheduling notes, or anything that would help — entirely optional."
          invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && <p className="mt-1.5 text-sm text-error-600">{errors.message.message}</p>}
      </div>

      <p className="rounded-md bg-neutral-100 px-3.5 py-2.5 text-xs text-neutral-600">
        Saving here doesn&apos;t send anything anywhere yet — there&apos;s no live admissions review connected. Your
        draft stays on this device until you submit it, and submitting only saves it here too, with a reference
        number so you can find it again.
      </p>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-neutral-200 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={childProfiles.length === 0}>
          Save draft
        </Button>
      </div>
    </form>
  );
}

export { ApplicationForm };
