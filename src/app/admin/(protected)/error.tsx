"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * The error boundary for every real admin page. Uses `retry` (stable as
 * of Next.js 16.3, per node_modules/next/dist/docs/.../error.md — the
 * older `reset` name still exists but the docs now recommend `retry`)
 * rather than inventing custom recovery logic: it just re-renders this
 * segment's children.
 */
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section className="py-10 sm:py-12">
      <Container className="max-w-3xl">
        <EmptyState
          variant="error"
          title="Something went wrong"
          description="This admin page hit an unexpected error. Your session is still signed in — try again, or head back to the admin dashboard."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={retry}>Try again</Button>
              <Button variant="outline" asChild>
                <a href="/admin">Back to admin</a>
              </Button>
            </div>
          }
        />
      </Container>
    </Section>
  );
}
