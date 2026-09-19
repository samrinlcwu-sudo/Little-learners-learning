"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AuthFormShell } from "@/components/patterns/auth-form-shell";
import { teacherAccountSchema, type TeacherAccountValues } from "@/lib/validations/teacher";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { createClient } from "@/lib/supabase/client";
import { createTeacherProfileRow } from "@/lib/accounts/remote-teacher";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Step 1 of teacher registration — real account creation (Prompt 110, see
 * docs/AUTHENTICATION_BACKEND_AUDIT.md). `supabase.auth.signUp()` creates
 * the real, password-protected account (the password itself is sent
 * straight to Supabase over HTTPS and never touches this codebase's own
 * storage or logs — see docs/TEACHER_ARCHITECTURE.md); the teacher's
 * profile row is created immediately after with the returned user's real
 * id. Whether the next screen is a real "check your email" step or goes
 * straight through depends on whether this Supabase project requires
 * email confirmation — `teacher-verify-notice.tsx` handles both outcomes.
 */
function TeacherRegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherAccountValues>({ resolver: zodResolver(teacherAccountSchema) });

  async function onSubmit(values: TeacherAccountValues) {
    setFormError(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { name: values.name, role: "teacher", countryRegion: values.countryRegion } },
    });

    if (error) {
      // Supabase's own message for this case is already clear and safe to
      // show verbatim; anything else gets a generic, non-leaking fallback.
      setFormError(
        error.message.toLowerCase().includes("already registered")
          ? "An account with that email already exists. Try signing in instead."
          : "We couldn't create your account. Please check your details and try again.",
      );
      return;
    }

    if (!data.user) {
      setFormError("We couldn't create your account. Please try again.");
      return;
    }

    // Only possible when this project doesn't require email confirmation
    // — otherwise there's no session yet to satisfy the profile table's
    // RLS insert policy. When confirmation is required, the profile is
    // created lazily on first real sign-in instead (see
    // `ensureOwnTeacherProfileExists`, remote-teacher.ts) — never here.
    if (data.session) {
      try {
        await createTeacherProfileRow(data.user.id, {
          name: values.name,
          email: values.email,
          countryRegion: values.countryRegion,
        });
      } catch {
        setFormError("Your account was created, but we couldn't set up your profile. Please try signing in.");
        return;
      }
    }

    trackEvent("teacher_registration_started");
    router.push(`/teachers/register/verify?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <AuthFormShell
      title="Create your teacher account"
      description="A professional home for your teaching profile, resources, and expertise."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {!isSupabaseConfigured && (
        <Alert variant="warning" className="mb-5">
          Accounts aren&apos;t connected on this deployment right now, so
          registration isn&apos;t available. Please try again later.
        </Alert>
      )}

      {formError && (
        <Alert variant="error" className="mb-5">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="teacher-name">Full name</Label>
          <Input
            id="teacher-name"
            autoComplete="name"
            invalid={!!errors.name}
            aria-describedby={errors.name ? "teacher-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="teacher-name-error" className="mt-1.5 text-sm text-error-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="teacher-email">Email</Label>
          <Input
            id="teacher-email"
            type="email"
            autoComplete="email"
            invalid={!!errors.email}
            aria-describedby={errors.email ? "teacher-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="teacher-email-error" className="mt-1.5 text-sm text-error-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="teacher-country">Country / Region</Label>
          <Input
            id="teacher-country"
            autoComplete="country-name"
            placeholder="e.g. United Kingdom"
            invalid={!!errors.countryRegion}
            aria-describedby={errors.countryRegion ? "teacher-country-error" : undefined}
            {...register("countryRegion")}
          />
          {errors.countryRegion && (
            <p id="teacher-country-error" className="mt-1.5 text-sm text-error-600">
              {errors.countryRegion.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="teacher-password">Password</Label>
          <PasswordInput
            id="teacher-password"
            autoComplete="new-password"
            invalid={!!errors.password}
            aria-describedby={errors.password ? "teacher-password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="teacher-password-error" className="mt-1.5 text-sm text-error-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!isSupabaseConfigured}>
          Create teacher account
        </Button>
      </form>
    </AuthFormShell>
  );
}

export { TeacherRegisterForm };
