"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** Same `retry` convention every other route-segment error boundary in this codebase uses — see src/app/admin/(protected)/error.tsx. */
export default function SearchError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section className="py-10 sm:py-12">
      <Container className="max-w-3xl">
        <EmptyState
          variant="error"
          title="Search hit an unexpected error"
          description="Something went wrong while loading search. Try again, or browse the site directly instead."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={retry}>Try again</Button>
              <Button variant="outline" asChild>
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          }
        />
      </Container>
    </Section>
  );
}
