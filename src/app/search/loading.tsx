import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/loading";

/**
 * The search page itself has no async data fetch (everything is a
 * synchronous filter over in-memory arrays — see src/app/search/page.tsx),
 * so this is only ever visible during the route transition/render itself,
 * not while "waiting for results." A real skeleton for that brief moment
 * is still worth having, the same reason every other page-level
 * `loading.tsx` in this codebase exists.
 */
export default function SearchLoading() {
  return (
    <Section className="py-10 sm:py-12">
      <Container>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-9 w-64" />
        <Skeleton className="mt-3 h-5 w-full max-w-md" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Skeleton className="h-11 sm:col-span-2" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </Container>
    </Section>
  );
}
