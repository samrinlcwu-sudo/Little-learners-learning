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
import { useTeacherProfile } from "@/lib/accounts/use-teacher-profile";

/**
 * Step 1 of teacher registration: just enough to create an account. Real
 * validation throughout (src/lib/validations/teacher.ts). What isn't real
 * yet is the account itself — no Supabase project is connected (see
 * src/lib/supabase/is-configured.ts) — but unlike the generic /sign-up
 * form, this one *does* save something real: name, email, and country are
 * written to this browser's local teacher record so the rest of the
 * flow (verify → complete profile → dashboard) has something to work
 * with. The password is validated for format and then discarded — it
 * never reaches localStorage or any variable outside this function. See
 * docs/TEACHER_ARCHITECTURE.md for the full reasoning.
 */
function TeacherRegisterForm() {
  const router = useRouter();
  const { createAccount } = useTeacherProfile();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherAccountValues>({ resolver: zodResolver(teacherAccountSchema) });

  function onSubmit(values: TeacherAccountValues) {
    // Once a Supabase project is connected, this branch calls
    // supabase.auth.signUp({ email, password, options: { data: { name, role: "teacher" } } })
    // instead. Until then: save the non-sensitive identity fields locally
    // (never the password — see the component note above) and move on to
    // the next step, exactly as the real flow would after a successful
    // sign-up.
    createAccount({ name: values.name, email: values.email, countryRegion: values.countryRegion });
    router.push("/teachers/register/verify");
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
        <Alert variant="info" className="mb-5">
          Accounts aren&apos;t connected to a live backend yet, so this
          won&apos;t create a real sign-in. Your name, email, and country
          are saved on this device only so you can try the rest of the
          registration flow.
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

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create teacher account
        </Button>
      </form>
    </AuthFormShell>
  );
}

export { TeacherRegisterForm };
