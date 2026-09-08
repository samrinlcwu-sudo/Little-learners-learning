"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTeacherProfile } from "@/lib/accounts/use-teacher-profile";

/**
 * The "Verify Account" step between account creation and profile
 * completion. Honest about the same gap as every other auth screen: no
 * email service is connected yet, so there's no real verification link to
 * send. Rather than skip the step (the requested flow explicitly includes
 * it) or fake a "verified!" state, this explains the gap plainly and lets
 * the teacher continue — matching the same "prepared, not simulated" rule
 * every other not-yet-connected feature on this site follows.
 */
function TeacherVerifyNotice() {
  const { teacher, ready } = useTeacherProfile();

  if (!ready) {
    return <Section className="min-h-[50vh]" />;
  }

  if (!teacher) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <Heading level="h1">Let&apos;s create your account first</Heading>
          <p className="mt-3 text-neutral-600">
            We couldn&apos;t find a teacher account on this device yet.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/teachers/register">Create teacher account</Link>
          </Button>
        </Container>
      </Section>
    );
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
          <p className="mt-2 text-sm text-neutral-600">
            We&apos;d send a confirmation link to <strong className="text-ink">{teacher.email}</strong>.
          </p>

          <Alert variant="info" className="mt-5 text-left">
            Email verification isn&apos;t connected to a live backend yet,
            so no email was actually sent. Once it is, this step becomes a
            real confirmation link — for now, you can continue straight to
            your professional profile.
          </Alert>

          <Button className="mt-6 w-full" asChild>
            <Link href="/teachers/register/profile">Continue to your profile</Link>
          </Button>
        </Card>
      </Container>
    </Section>
  );
}

export { TeacherVerifyNotice };
