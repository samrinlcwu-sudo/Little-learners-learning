import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, BookOpen, Library } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/patterns/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with Little Learners Learning, or check the FAQ before writing in.",
  alternates: { canonical: `${siteConfig.url}/support` },
};

const quickLinks = [
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Answers to the questions people ask most.",
    href: "/faq",
  },
  {
    icon: BookOpen,
    title: "Learn",
    description: "Browse subjects and see what's covered.",
    href: "/learn",
  },
  {
    icon: Library,
    title: "Resources",
    description: "Search the worksheet and activity library.",
    href: "/resources",
  },
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Support" }]}
        eyebrow="Contact & Support"
        title="Support"
        description="Have a question or found a problem? Check the quick links below, or use the form — it's ready, but not connected to a live inbox yet."
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
              >
                <Card interactive className="flex h-full flex-col gap-2 p-5">
                  <link.icon className="size-5 text-primary-600" aria-hidden="true" />
                  <p className="font-semibold text-ink">{link.title}</p>
                  <p className="text-sm text-neutral-600">{link.description}</p>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <Heading level="h2">Send a message</Heading>
            <Alert variant="info" title="Not connected yet" className="mt-4">
              This form isn&apos;t wired up to a live inbox, so sending is
              disabled for now. Fill it in to see what&apos;s coming —
              nothing you type here is saved or sent anywhere.
            </Alert>

            <form className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="support-name">Name</Label>
                <Input id="support-name" name="name" placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="support-email">Email</Label>
                <Input id="support-email" name="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="support-role">I am a...</Label>
                <Select id="support-role" name="role" defaultValue="">
                  <option value="" disabled>
                    Select one
                  </option>
                  <option value="parent">Parent</option>
                  <option value="teacher">Teacher</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="support-message">Message</Label>
                <Textarea id="support-message" name="message" placeholder="How can we help?" rows={5} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled title="Coming soon">
                  Send message
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </Section>
    </>
  );
}
