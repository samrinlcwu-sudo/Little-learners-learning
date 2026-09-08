"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Lock, UserX } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { TeacherPublicProfileContent } from "@/components/patterns/teacher-public-profile-content";
import { useTeacherProfile } from "@/lib/accounts/use-teacher-profile";
import { toPublicTeacherProfile } from "@/lib/accounts/teacher-public-profile";
import { canViewTeacherProfile } from "@/lib/accounts/teacher-visibility";

/**
 * The real public route (/teachers/p/[slug]) — genuinely gated by
 * `visibility`, not just "unlisted." Because there's still no backend
 * (docs/TEACHER_ARCHITECTURE.md), the only profile this page can ever
 * actually find is the one saved in the visitor's own browser; it says so
 * plainly rather than pretending a lookup happened against a real
 * database. This is the same "prepared architecture, not simulated"
 * pattern as the rest of the account system — the access-control logic
 * (visibility check, field allowlist) is real and will work unchanged
 * once a real lookup replaces the local one.
 */
function TeacherPublicProfilePage() {
  const params = useParams<{ slug: string }>();
  const { teacher, ready } = useTeacherProfile();

  if (!ready) {
    return <Section className="min-h-[60vh]" />;
  }

  const matches = teacher && teacher.slug === params.slug;

  if (!matches) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <UserX className="size-7" aria-hidden="true" />
          </div>
          <Heading level="h1" className="mt-5">
            We couldn&apos;t find this profile
          </Heading>
          <p className="mt-3 text-neutral-600">
            Teacher profiles aren&apos;t connected to a shared database yet
            — a public profile link only works in the browser it was
            created in. See{" "}
            <Link href="/teachers" className="font-medium text-primary-700 hover:underline">
              For Teachers
            </Link>{" "}
            for what&apos;s live today.
          </p>
        </Container>
      </Section>
    );
  }

  if (!canViewTeacherProfile(teacher)) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <Lock className="size-7" aria-hidden="true" />
          </div>
          <Heading level="h1" className="mt-5">
            This profile isn&apos;t available
          </Heading>
          <p className="mt-3 text-neutral-600">
            {teacher.visibility !== "public"
              ? "Its owner hasn't made it public yet."
              : "It isn't currently visible to the public."}
          </p>
          <Button className="mt-6" asChild>
            <Link href="/teachers/dashboard">Go to your dashboard</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  return (
    <Section surface="sunken" className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <TeacherPublicProfileContent profile={toPublicTeacherProfile(teacher)} />
      </Container>
    </Section>
  );
}

export { TeacherPublicProfilePage };
