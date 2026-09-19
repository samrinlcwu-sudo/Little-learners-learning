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
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { createClient } from "@/lib/supabase/client";

/**
 * Real account creation (Prompt 110, see
 * docs/AUTHENTICATION_BACKEND_AUDIT.md). Whether this redirects straight
 * to the dashboard or shows a "check your email" step depends on whether
 * this Supabase project requires email confirmation — both outcomes are
 * handled honestly rather than assuming either.
 *
 * Parent-only: a teacher wants the richer, dedicated flow at
 * /teachers/register (professional profile, country, etc.), not this
 * generic form with a role picker bolted on — see the footer link below.
 */
function SignUpForm() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(values: SignUpValues) {
    setFormError(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { name: values.name, role: "parent" } },
    });

    if (error) {
      setFormError(
        error.message.toLowerCase().includes("already registered")
          ? "An account with that email already exists. Try signing in instead."
          : "We couldn't create your account. Please check your details and try again.",
      );
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // No session yet means this project requires email confirmation.
    setNeedsConfirmation(true);
  }

  async function handleResend() {
    const email = getValues("email");
    if (!email) return;
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (!error) setResent(true);
  }

  return (
    <AuthFormShell
      title="Create your account"
      description="For parents guiding a child's early learning."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary-700 hover:underline">
            Sign in
          </Link>
          <br />
          Are you a teacher?{" "}
          <Link href="/teachers/register" className="font-medium text-primary-700 hover:underline">
            Create a teacher account
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

      {needsConfirmation ? (
        <Alert variant="success" title="Check your email">
          We sent a confirmation link to <strong>{getValues("email")}</strong>. Click it, then come back and
          sign in.
          {resent ? (
            <p className="mt-2 font-medium">Sent again — give it a minute to arrive.</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="mt-2 block font-medium text-primary-700 hover:underline"
            >
              Resend confirmation email
            </button>
          )}
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

          <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!isSupabaseConfigured}>
            Create account
          </Button>
        </form>
      )}
    </AuthFormShell>
  );
}

export { SignUpForm };
