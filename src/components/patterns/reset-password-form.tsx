"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AuthFormShell } from "@/components/patterns/auth-form-shell";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/auth";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

function ResetPasswordForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  function onSubmit() {
    // Once a Supabase project is connected, this branch calls
    // supabase.auth.updateUser({ password }) using the session Supabase
    // establishes from the reset-link token in the URL. Until then, there's
    // no token to act on and no password to actually change.
    setSubmitted(true);
  }

  return (
    <AuthFormShell
      title="Choose a new password"
      description="You'd normally arrive here from a link in a password-reset email."
      footer={
        <>
          Back to{" "}
          <Link href="/sign-in" className="font-medium text-primary-700 hover:underline">
            sign in
          </Link>
        </>
      }
    >
      {!isSupabaseConfigured && (
        <Alert variant="info" className="mb-5">
          Accounts aren&apos;t connected to a live backend yet, so no
          password can actually be changed today.
        </Alert>
      )}

      {submitted ? (
        <Alert variant="success" title="Looks good">
          That password passed every check. Changing it isn&apos;t connected
          yet, so nothing was actually updated — check back once it is.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="reset-password">New password</Label>
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              invalid={!!errors.password}
              aria-describedby={errors.password ? "reset-password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p id="reset-password-error" className="mt-1.5 text-sm text-error-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Update password
          </Button>
        </form>
      )}
    </AuthFormShell>
  );
}

export { ResetPasswordForm };
