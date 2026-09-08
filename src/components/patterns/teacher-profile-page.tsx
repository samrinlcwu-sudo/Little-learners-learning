"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/patterns/page-header";
import { TeacherProfileForm } from "@/components/patterns/teacher-profile-form";
import { useTeacherProfile } from "@/lib/accounts/use-teacher-profile";
import type { TeacherProfileValues } from "@/lib/validations/teacher";

/**
 * Step 2's page shell — also reused for every later "edit my profile" visit
 * from the dashboard, so there's one place this form lives, not two.
 */
function TeacherProfilePage() {
  const router = useRouter();
  const { teacher, ready, updateProfile } = useTeacherProfile();

  if (!ready) {
    return <Section className="min-h-[60vh]" />;
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

  const isFirstTime = !teacher.bio && !teacher.education && teacher.subjects.length === 0;

  function handleSave(values: TeacherProfileValues & { photo?: string }) {
    updateProfile(values);
    router.push("/teachers/dashboard");
  }

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Teacher Dashboard", href: "/teachers/dashboard" },
          { label: "Complete profile" },
        ]}
        eyebrow="Teacher Profile"
        title={isFirstTime ? "Complete your professional profile" : "Edit your professional profile"}
        description="Every field here is optional — fill in as much or as little as you like now, and come back anytime."
        surface="tint-secondary"
      />
      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl">
          <Card className="p-6 sm:p-8">
            <TeacherProfileForm teacher={teacher} onSave={handleSave} isFirstTime={isFirstTime} />
          </Card>
        </Container>
      </Section>
    </>
  );
}

export { TeacherProfilePage };
