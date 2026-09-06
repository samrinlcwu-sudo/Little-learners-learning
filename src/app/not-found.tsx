import Link from "next/link";
import { Compass } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Section surface="sunken" className="flex flex-1 flex-col justify-center">
      <Container className="max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <Compass className="size-7" aria-hidden="true" />
        </div>
        <Heading level="h1" className="mt-5">
          Page not found
        </Heading>
        <p className="mt-3 text-neutral-600">
          The page you&apos;re looking for doesn&apos;t exist, or may have
          moved. Here&apos;s where to go instead.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/learn">Explore Learning</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
