"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { createClient } from "@/lib/supabase/client";
import { ensureOwnTeacherProfileExists } from "@/lib/accounts/remote-teacher";

/**
 * Real authentication (Prompt 110, see
 * docs/AUTHENTICATION_BACKEND_AUDIT.md). Redirects to `?from=` when
 * `proxy.ts` sent the visitor here after blocking an unauthenticated
 * request to a protected route, so signing in returns them exactly where
 * they were headed. Falls back to the account's own role
 * (`user_metadata.role`, set at sign-up) to choose between the parent and
 * teacher dashboards when there's no `from` to honor.
 */
function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInValues) {
    setFormError(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFormError(
        error.message.toLowerCase().includes("email not confirmed")
          ? "Please confirm your email before signing in — check your inbox for the confirmation link."
          : "Incorrect email or password.",
      );
      return;
    }

    const from = searchParams.get("from");
    const role = data.user?.user_metadata?.role;

    if (role === "teacher") {
      // Idempotent — creates the profile row lazily on a teacher's first
      // real sign-in (post email-confirmation) if it doesn't exist yet;
      // just a read otherwise. See `ensureOwnTeacherProfileExists`.
      const { justCreated } = await ensureOwnTeacherProfileExists();
      router.push(justCreated ? "/teachers/register/profile" : from || "/teachers/dashboard");
      router.refresh();
      return;
    }

    router.push(from || "/dashboard");
    router.refresh();
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
        <Alert variant="warning" className="mb-5">
          Accounts aren&apos;t connected on this deployment right now, so
          signing in isn&apos;t available.
        </Alert>
      )}

      {formError && (
        <Alert variant="error" className="mb-5">
          {formError}
        </Alert>
      )}

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

        <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!isSupabaseConfigured}>
          Sign in
        </Button>
      </form>
    </AuthFormShell>
  );
}

export { SignInForm };
