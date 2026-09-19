"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/lib/supabase/use-supabase-user";
import { createClient } from "@/lib/supabase/client";

/**
 * The "Verify Account" step between account creation and profile
 * completion — real since Prompt 110 (see
 * docs/AUTHENTICATION_BACKEND_AUDIT.md). Whether a visitor lands here
 * already signed in (this Supabase project doesn't require email
 * confirmation) or genuinely needs to click a real link Supabase just
 * sent depends entirely on this project's own auth settings — this
 * component handles both outcomes honestly rather than assuming either.
 */
function TeacherVerifyNotice() {
  const { user, ready } = useSupabaseUser();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [resent, setResent] = React.useState(false);
  const [resendError, setResendError] = React.useState<string | null>(null);
  const [resending, setResending] = React.useState(false);

  if (!ready) {
    return <Section className="min-h-[50vh]" />;
  }

  if (!user && !email) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <Heading level="h1">Let&apos;s create your account first</Heading>
          <p className="mt-3 text-neutral-600">We couldn&apos;t find an account to verify yet.</p>
          <Button className="mt-6" asChild>
            <Link href="/teachers/register">Create teacher account</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setResendError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) {
      setResendError("We couldn't resend the confirmation email right now. Please try again shortly.");
      return;
    }
    setResent(true);
  }

  return (
    <Section surface="sunken" className="flex flex-1 items-center py-12 sm:py-16">
      <Container className="max-w-sm text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <MailCheck className="size-7" aria-hidden="true" />
        </div>

        <Card className="mt-6 p-6 sm:p-8">
          <Heading level="h3" as="h1">
            Verify your email
          </Heading>

          {user ? (
            <>
              <p className="mt-2 text-sm text-neutral-600">
                Your account is ready — you can continue straight to your professional profile.
              </p>
              <Button className="mt-6 w-full" asChild>
                <Link href="/teachers/register/profile">Continue to your profile</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-neutral-600">
                We sent a confirmation link to <strong className="text-ink">{email}</strong>. Click it to
                activate your account, then come back here and sign in.
              </p>

              <Alert variant="info" className="mt-5 text-left">
                Didn&apos;t get it? Check your spam folder, or resend it below.
              </Alert>

              {resendError && (
                <Alert variant="error" className="mt-3 text-left">
                  {resendError}
                </Alert>
              )}

              {resent ? (
                <Alert variant="success" className="mt-3 text-left">
                  Sent again — give it a minute to arrive.
                </Alert>
              ) : (
                <Button variant="outline" className="mt-6 w-full" onClick={handleResend} isLoading={resending}>
                  Resend confirmation email
                </Button>
              )}

              <Button className="mt-3 w-full" asChild>
                <Link href="/sign-in">I&apos;ve confirmed — sign in</Link>
              </Button>
            </>
          )}
        </Card>
      </Container>
    </Section>
  );
}

export { TeacherVerifyNotice };
