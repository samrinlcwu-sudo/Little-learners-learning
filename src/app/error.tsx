"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with real error reporting (e.g. Sentry) once monitoring is wired up.
    console.error(error);
  }, [error]);

  return (
    <Section surface="sunken" className="flex flex-1 flex-col justify-center">
      <Container className="max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-error-100 text-error-700">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>
        <Heading level="h1" className="mt-5">
          Something went wrong
        </Heading>
        <p className="mt-3 text-neutral-600">
          This page hit an unexpected error — it&apos;s not something you
          did. Try again, or head back home.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
