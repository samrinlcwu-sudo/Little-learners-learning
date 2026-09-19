"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AuthFormShell } from "@/components/patterns/auth-form-shell";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/auth";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { createClient } from "@/lib/supabase/client";

/**
 * Real password update (Prompt 110). Works only when arrived at via the
 * real link `resetPasswordForEmail` sends (`forgot-password-form.tsx`) —
 * that link's own token is what establishes the temporary recovery
 * session `supabase.auth.updateUser` needs; visiting this page directly
 * with no such session correctly fails with a real, honest error.
 */
function ResetPasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setFormError("That reset link has expired or is invalid. Please request a new one.");
      return;
    }
    setSubmitted(true);
    setTimeout(() => router.push("/sign-in"), 2000);
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
        <Alert variant="warning" className="mb-5">
          Accounts aren&apos;t connected on this deployment right now, so no
          password can be changed today.
        </Alert>
      )}

      {formError && (
        <Alert variant="error" className="mb-5">
          {formError}
        </Alert>
      )}

      {submitted ? (
        <Alert variant="success" title="Password updated">
          Taking you to sign in&hellip;
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

          <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!isSupabaseConfigured}>
            Update password
          </Button>
        </form>
      )}
    </AuthFormShell>
  );
}

export { ResetPasswordForm };
