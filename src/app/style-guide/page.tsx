import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Spinner, Skeleton } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { DecorativeBlob } from "@/components/ui/decorative-blob";
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from "@/components/ui/modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/layouts/content-layout";
import { ResourceLayout } from "@/components/layouts/resource-layout";
import { DashboardShellLayout } from "@/components/layouts/dashboard-shell-layout";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const metadata: Metadata = {
  title: "Style Guide",
  robots: { index: false, follow: false },
};

function Swatch({ name, className, textClassName = "text-white" }: { name: string; className: string; textClassName?: string }) {
  return (
    <div className={`flex h-20 flex-col justify-between rounded-md p-3 ${className}`}>
      <span className={`text-xs font-medium ${textClassName}`}>{name}</span>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <>
      <Section className="border-b border-neutral-200 py-12">
        <Container>
          <Breadcrumb items={[{ label: "Internal", href: "/" }, { label: "Style Guide" }]} />
          <Heading level="display" className="mt-4">
            Design System
          </Heading>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Internal reference for every foundational component. Not a public
            page — used to validate the visual system across breakpoints.
          </p>
        </Container>
      </Section>

      {/* Color system */}
      <Section>
        <Container>
          <Heading level="h2">Color system</Heading>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Swatch name="Primary 600" className="bg-primary-600" />
            <Swatch name="Primary 800" className="bg-primary-800" />
            <Swatch name="Secondary 600" className="bg-secondary-600" />
            <Swatch name="Secondary 800" className="bg-secondary-800" />
            <Swatch name="Accent 400" className="bg-accent-400" textClassName="text-ink" />
            <Swatch name="Neutral 200" className="bg-neutral-200" textClassName="text-ink" />
            <Swatch name="Neutral 600" className="bg-neutral-600" />
            <Swatch name="Ink 900" className="bg-neutral-900" />
            <Swatch name="Success 600" className="bg-success-600" />
            <Swatch name="Warning 600" className="bg-warning-600" />
            <Swatch name="Error 700" className="bg-error-700" />
            <Swatch name="Surface Sunken" className="bg-surface-sunken border border-neutral-200" textClassName="text-ink" />
          </div>
        </Container>
      </Section>

      {/* Typography */}
      <Section surface="sunken">
        <Container className="space-y-4">
          <Heading level="h2">Typography</Heading>
          <Heading level="display">Display heading</Heading>
          <Heading level="h1">Heading 1 — Fraunces</Heading>
          <Heading level="h2">Heading 2 — Fraunces</Heading>
          <Heading level="h3">Heading 3 — Fraunces</Heading>
          <Heading level="h4">Heading 4 — Inter</Heading>
          <p className="max-w-2xl text-base text-ink">
            Body text uses Inter for maximum readability at small sizes across
            forms, cards, and long-form copy. Fraunces is reserved for
            headings and display moments — it carries the warmth without
            being used for the text people actually read.
          </p>
          <p className="text-sm text-neutral-600">
            Small / secondary text — helper copy, captions, metadata.
          </p>
        </Container>
      </Section>

      {/* Buttons */}
      <Section>
        <Container className="space-y-6">
          <Heading level="h2">Buttons</Heading>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" isLoading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Container>
      </Section>

      {/* Badges */}
      <Section surface="sunken">
        <Container className="space-y-4">
          <Heading level="h2">Badges</Heading>
          <div className="flex flex-wrap gap-3">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        </Container>
      </Section>

      {/* Alerts */}
      <Section>
        <Container className="space-y-4">
          <Heading level="h2">Alerts</Heading>
          <Alert variant="info" title="Heads up">
            Informational messages use the primary palette, not blue-by-default.
          </Alert>
          <Alert variant="success" title="Saved">
            Changes were saved successfully.
          </Alert>
          <Alert variant="warning" title="Check this">
            Something needs attention before continuing.
          </Alert>
          <Alert variant="error" title="Something went wrong">
            The action couldn&apos;t be completed. Every alert pairs an icon
            with color, never color alone.
          </Alert>
        </Container>
      </Section>

      {/* Form controls */}
      <Section surface="sunken">
        <Container className="max-w-lg space-y-5">
          <Heading level="h2">Form controls</Heading>
          <div>
            <Label htmlFor="sg-name">Name</Label>
            <Input id="sg-name" placeholder="Jane Parent" />
          </div>
          <div>
            <Label htmlFor="sg-role">Role</Label>
            <Select id="sg-role" defaultValue="">
              <option value="" disabled>
                Select a role
              </option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="sg-message">Message</Label>
            <Textarea id="sg-message" placeholder="Tell us more…" />
          </div>
          <div>
            <Label htmlFor="sg-invalid">Email (invalid state)</Label>
            <Input id="sg-invalid" invalid defaultValue="not-an-email" aria-describedby="sg-invalid-error" />
            <p id="sg-invalid-error" className="mt-1.5 text-sm text-error-600">
              Enter a valid email address.
            </p>
          </div>
        </Container>
      </Section>

      {/* Cards */}
      <Section>
        <Container>
          <Heading level="h2">Cards</Heading>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Learning resource</CardTitle>
                <CardDescription>Example card content for layout only.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600">
                  Cards use a soft shadow and a single border — no gradients, no drop-heavy effects.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Example action
                </Button>
              </CardFooter>
            </Card>
            <Card className="relative overflow-hidden">
              <DecorativeBlob tone="accent" className="pointer-events-none absolute -right-10 -top-10 size-40 opacity-40" />
              <CardHeader>
                <CardTitle>With decorative accent</CardTitle>
                <CardDescription>Used sparingly, never as the focal point.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Third card</CardTitle>
                <CardDescription>Grid reflows to a single column on mobile.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Tabs & Dropdown */}
      <Section surface="sunken">
        <Container className="grid gap-10 sm:grid-cols-2">
          <div>
            <Heading level="h2">Tabs</Heading>
            <Tabs defaultValue="one" className="mt-4">
              <TabsList>
                <TabsTrigger value="one">Overview</TabsTrigger>
                <TabsTrigger value="two">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="one">Overview panel content.</TabsContent>
              <TabsContent value="two">Details panel content.</TabsContent>
            </Tabs>
          </div>
          <div>
            <Heading level="h2">Dropdown</Heading>
            <div className="mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Container>
      </Section>

      {/* Modal */}
      <Section>
        <Container>
          <Heading level="h2">Modal</Heading>
          <div className="mt-4">
            <Modal>
              <ModalTrigger asChild>
                <Button>Open modal</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>Confirm action</ModalTitle>
                  <ModalDescription>
                    Focus is trapped inside while open, and Escape closes it.
                  </ModalDescription>
                </ModalHeader>
                <ModalFooter>
                  <ModalClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </ModalClose>
                  <ModalClose asChild>
                    <Button>Confirm</Button>
                  </ModalClose>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
        </Container>
      </Section>

      {/* Loading, empty, error states */}
      <Section surface="sunken">
        <Container className="space-y-8">
          <div>
            <Heading level="h2">Loading states</Heading>
            <div className="mt-4 flex flex-wrap items-center gap-8">
              <Spinner />
              <div className="w-64 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <EmptyState
              title="No resources yet"
              description="Once resources are added, they'll appear here."
            />
            <EmptyState
              variant="error"
              title="Couldn't load this page"
              description="Try again in a moment."
              action={
                <Button size="sm" variant="outline">
                  Retry
                </Button>
              }
            />
          </div>
        </Container>
      </Section>

      {/* Layout system */}
      <Section surface="sunken">
        <Container className="space-y-10">
          <div>
            <Heading level="h2">Layout system</Heading>
            <p className="mt-2 max-w-2xl text-neutral-600">
              Reusable page shapes — not routed anywhere yet, previewed here
              in isolation so the structure can be validated before real
              pages adopt them.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-neutral-500">
              ContentLayout — reading-width pages (articles, resource detail)
            </p>
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-surface">
              <ContentLayout
                breadcrumb={[{ label: "Resources", href: "/resources" }, { label: "Example" }]}
                title="Example article title"
                description="A one-line summary shown beneath the title."
              >
                <p>Body copy renders in a comfortable reading width, not full-bleed.</p>
              </ContentLayout>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-neutral-500">
              ResourceLayout — browsing/listing pages, with an optional filter rail
            </p>
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-surface">
              <ResourceLayout
                breadcrumb={[{ label: "Resources" }]}
                title="Example listing title"
                filters={
                  <div className="rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
                    Filter controls slot
                  </div>
                }
              >
                <div className="rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
                  Result grid slot
                </div>
              </ResourceLayout>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-neutral-500">
              DashboardShellLayout — shared shape for future parent/teacher/admin areas (no route exists yet)
            </p>
            <DashboardShellLayout
              title="Parent Dashboard"
              activeHref="#children"
              navItems={[
                { label: "Overview", href: "#overview" },
                { label: "Children", href: "#children" },
                { label: "Progress", href: "#progress" },
              ]}
            >
              <p className="text-sm text-neutral-500">Content area slot.</p>
            </DashboardShellLayout>
          </div>
        </Container>
      </Section>
    </>
  );
}
