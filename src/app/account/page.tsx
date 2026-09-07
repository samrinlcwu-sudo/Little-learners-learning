import type { Metadata } from "next";
import Link from "next/link";
import { UserCircle } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Little Learners Learning account.",
  robots: { index: false, follow: false },
};

/**
 * There is no session system yet, so every visitor reaches this page
 * signed out — this page must never invent a name, email, or dashboard
 * content to display. Once real auth exists, this becomes the entry point
 * that branches to a parent or teacher dashboard based on the signed-in
 * account's role.
 */
export default function AccountPage() {
  return (
    <Section surface="sunken" className="flex flex-1 flex-col justify-center">
      <Container className="max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <UserCircle className="size-7" aria-hidden="true" />
        </div>
        <Heading level="h1" className="mt-5">
          You&apos;re not signed in
        </Heading>
        <p className="mt-3 text-neutral-600">
          Accounts aren&apos;t connected to a live backend yet, so
          there&apos;s nothing to show here. Once they are, this page
          becomes your parent or teacher dashboard.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-up">Create account</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
