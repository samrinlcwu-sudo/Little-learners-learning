"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AuthFormShell } from "@/components/patterns/auth-form-shell";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordValues) {
    const supabase = createClient();
    // Deliberately ignores the result either way (Supabase itself never
    // reveals whether an email is registered) — always showing the same
    // "check your email" outcome is what prevents this form from being
    // usable to test which emails have an account.
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitted(true);
  }

  return (
    <AuthFormShell
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/sign-in" className="font-medium text-primary-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {!isSupabaseConfigured && (
        <Alert variant="warning" className="mb-5">
          Accounts aren&apos;t connected on this deployment right now, so no
          reset email can be sent today.
        </Alert>
      )}

      {submitted ? (
        <Alert variant="success" title="Check your email">
          If an account exists for that address, a reset link is on its way.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              invalid={!!errors.email}
              aria-describedby={errors.email ? "forgot-email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="forgot-email-error" className="mt-1.5 text-sm text-error-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!isSupabaseConfigured}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthFormShell>
  );
}

export { ForgotPasswordForm };
