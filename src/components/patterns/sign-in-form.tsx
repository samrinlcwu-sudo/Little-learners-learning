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
import { signInSchema, type SignInValues } from "@/lib/validations/auth";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

function SignInForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  function onSubmit() {
    // Once a Supabase project is connected, this branch calls
    // supabase.auth.signInWithPassword({ email, password }) and redirects
    // to /account on success. Until then, every submission ends here.
    setSubmitted(true);
  }

  return (
    <AuthFormShell
      title="Sign in"
      description="Welcome back."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-primary-700 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {!isSupabaseConfigured && (
        <Alert variant="info" className="mb-5">
          Accounts aren&apos;t connected to a live backend yet, so signing in
          isn&apos;t possible today.
        </Alert>
      )}

      {submitted ? (
        <Alert variant="success" title="Looks good">
          That email and password passed every check. Signing in itself
          isn&apos;t connected yet, so nothing happened beyond this — check
          back once it is.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              type="email"
              autoComplete="email"
              invalid={!!errors.email}
              aria-describedby={errors.email ? "signin-email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="signin-email-error" className="mt-1.5 text-sm text-error-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="signin-password" className="mb-0">
                Password
              </Label>
              <Link href="/forgot-password" className="text-sm text-primary-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="signin-password"
              autoComplete="current-password"
              invalid={!!errors.password}
              aria-describedby={errors.password ? "signin-password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p id="signin-password-error" className="mt-1.5 text-sm text-error-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>
      )}
    </AuthFormShell>
  );
}

export { SignInForm };
