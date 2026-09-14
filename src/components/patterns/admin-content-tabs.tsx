"use client";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/patterns/page-header";
import { AdminResourceList } from "@/components/patterns/admin-resource-list";
import { AdminGameList } from "@/components/patterns/admin-game-list";

/**
 * The Admin Content Library (Prompt 67) — Resources and Games are two
 * distinct content kinds in this codebase's architecture (see
 * src/lib/resources/types.ts vs. src/lib/games/types.ts), so they're two
 * tabs of one section rather than one blended table. See
 * docs/CONTENT_MANAGEMENT_ARCHITECTURE.md.
 *
 * Kept as a client component separate from its route's `page.tsx` (Prompt
 * 68 checkpoint fix) — a "use client" page can't export `metadata`, which
 * had left this route without the `noindex` every other admin page sets.
 * Splitting it out the same way `admin-teacher-list.tsx`/`admin-user-list.tsx`
 * already are lets the route file stay a server component.
 */
function AdminContentTabs() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: "Content" }]}
        eyebrow="Admin"
        title="Content library"
        description="Manage resources, and review the games catalog, from one place."
        surface="tint-secondary"
      />
      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-6xl">
          <Tabs defaultValue="resources">
            <TabsList>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="games">Games</TabsTrigger>
            </TabsList>
            <TabsContent value="resources">
              <AdminResourceList />
            </TabsContent>
            <TabsContent value="games">
              <AdminGameList />
            </TabsContent>
          </Tabs>
        </Container>
      </Section>
    </>
  );
}

export { AdminContentTabs };
