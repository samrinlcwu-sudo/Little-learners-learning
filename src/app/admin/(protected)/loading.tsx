import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/loading";

/**
 * Generic across every admin page (Next.js wraps `page.tsx` in a
 * `<Suspense>` boundary using this file — docs/PAYMENT_ARCHITECTURE.md-style
 * "check the docs before writing" applied to `loading.tsx`/`error.tsx`
 * conventions, which node_modules/next/dist/docs confirms are unchanged
 * in this Next.js version). Deliberately shape-agnostic: it reserves
 * roughly the space a heading + a card grid takes, since every real admin
 * page (`/admin`, `/admin/users`, `/admin/teachers`, their detail pages)
 * renders roughly that shape — never a page-specific skeleton that would
 * drift out of sync with a page it doesn't know about.
 */
export default function AdminLoading() {
  return (
    <Section className="py-10 sm:py-12">
      <Container className="max-w-5xl">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-9 w-64" />
        <Skeleton className="mt-3 h-5 w-full max-w-md" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </Container>
    </Section>
  );
}
