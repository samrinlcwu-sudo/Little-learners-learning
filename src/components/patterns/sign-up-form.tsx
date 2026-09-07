"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AuthFormShell } from "@/components/patterns/auth-form-shell";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

/**
 * Fully real validation (see src/lib/validations/auth.ts) — every error
 * shown here is genuine. What isn't real yet is the account itself: no
 * Supabase project is connected (see src/lib/supabase/is-configured.ts),
 * so submitting never creates one. It never pretends otherwise.
 */
function SignUpForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });

  function onSubmit() {
    // Once a Supabase project is connected, this branch calls
    // supabase.auth.signUp({ email, password, options: { data: { name, role } } })
    // and redirects on success. Until then, every submission ends here.
    setSubmitted(true);
  }

  return (
    <AuthFormShell
      title="Create your account"
      description="For parents and teachers guiding a child's early learning."
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
          Accounts aren&apos;t connected to a live backend yet. Feel free to
          fill this in — nothing is created or stored.
        </Alert>
      )}

      {submitted ? (
        <Alert variant="success" title="Looks good">
          Everything you entered passed every check. Account creation itself
          isn&apos;t connected yet, so nothing was actually created — check
          back once it is.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="signup-name">Name</Label>
            <Input
              id="signup-name"
              autoComplete="name"
              invalid={!!errors.name}
              aria-describedby={errors.name ? "signup-name-error" : undefined}
              {...register("name")}
            />
            {errors.name && (
              <p id="signup-name-error" className="mt-1.5 text-sm text-error-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              invalid={!!errors.email}
              aria-describedby={errors.email ? "signup-email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="signup-email-error" className="mt-1.5 text-sm text-error-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-ink">I am a...</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["parent", "teacher"] as const).map((role) => (
                <label
                  key={role}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-neutral-300 px-3 py-2.5 text-sm font-medium capitalize text-ink transition-colors has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-800 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-600/30"
                >
                  <input type="radio" value={role} className="sr-only" {...register("role")} />
                  {role}
                </label>
              ))}
            </div>
            {errors.role && <p className="mt-1.5 text-sm text-error-600">{errors.role.message}</p>}
          </fieldset>

          <div>
            <Label htmlFor="signup-password">Password</Label>
            <PasswordInput
              id="signup-password"
              autoComplete="new-password"
              invalid={!!errors.password}
              aria-describedby={errors.password ? "signup-password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p id="signup-password-error" className="mt-1.5 text-sm text-error-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create account
          </Button>
        </form>
      )}
    </AuthFormShell>
  );
}

export { SignUpForm };
