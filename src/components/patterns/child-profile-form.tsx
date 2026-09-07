"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CHILD_AVATARS } from "@/lib/accounts/child-avatars";
import { getAllLearningCategories } from "@/config/learning-categories";
import {
  childProfileSchema,
  type ChildProfileInput,
  type ChildProfileValues,
} from "@/lib/validations/child-profile";
import type { ChildProfile } from "@/lib/accounts/types";
import { cn } from "@/lib/utils/cn";

export interface ChildProfileFormProps {
  /** Pass an existing profile to edit it; omit to add a new one. */
  initialValues?: ChildProfile;
  onSave: (values: ChildProfileValues) => void;
  onCancel: () => void;
}

/**
 * Real client-side validation, same Zod + React Hook Form pattern as the
 * auth forms — but unlike those, saving here genuinely works: a child
 * profile is just data the parent typed in, stored in this browser (see
 * src/lib/accounts/local-children.ts), not a real account needing a real
 * backend.
 */
function ChildProfileForm({ initialValues, onSave, onCancel }: ChildProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChildProfileInput, unknown, ChildProfileValues>({
    resolver: zodResolver(childProfileSchema),
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          ageYears: initialValues.ageYears,
          avatar: initialValues.avatar,
          favoriteCategory: initialValues.favoriteCategory ?? "",
        }
      : { avatar: CHILD_AVATARS[0].id },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="child-name">Child&apos;s name</Label>
        <Input
          id="child-name"
          invalid={!!errors.name}
          aria-describedby={errors.name ? "child-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="child-name-error" className="mt-1.5 text-sm text-error-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="child-age">Age</Label>
        <Input
          id="child-age"
          type="number"
          min={1}
          max={12}
          inputMode="numeric"
          invalid={!!errors.ageYears}
          aria-describedby={errors.ageYears ? "child-age-error" : undefined}
          {...register("ageYears")}
        />
        {errors.ageYears && (
          <p id="child-age-error" className="mt-1.5 text-sm text-error-600">
            {errors.ageYears.message}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink">Pick an avatar</legend>
        <div className="grid grid-cols-6 gap-2">
          {CHILD_AVATARS.map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-neutral-300 text-xl transition-colors",
                option.bg,
                "has-[:checked]:border-2 has-[:checked]:border-primary-600 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-600/30",
              )}
            >
              <input type="radio" value={option.id} className="sr-only" {...register("avatar")} />
              <span aria-hidden="true">{option.emoji}</span>
              <span className="sr-only">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.avatar && <p className="mt-1.5 text-sm text-error-600">{errors.avatar.message}</p>}
      </fieldset>

      <div>
        <Label htmlFor="child-favorite">Favorite subject (optional)</Label>
        <Select id="child-favorite" {...register("favoriteCategory")}>
          <option value="">No preference yet</option>
          {getAllLearningCategories().map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialValues ? "Save changes" : "Add child"}
        </Button>
      </div>
    </form>
  );
}

export { ChildProfileForm };
