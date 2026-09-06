import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";

export default function Home() {
  return (
    <Section className="flex flex-1 items-center">
      <Container className="text-center">
        <Heading level="display">Little Learners Learning</Heading>
        <p className="mx-auto mt-4 max-w-xl text-neutral-600">
          Visual foundation in place. Homepage content lands in a later build
          phase.
        </p>
      </Container>
    </Section>
  );
}
