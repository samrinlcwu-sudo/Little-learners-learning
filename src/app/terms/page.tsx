import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/patterns/page-header";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "The terms for using Little Learners Learning, based on the platform's current functionality.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description,
  // A policy page describes rules, it doesn't compete for search
  // traffic — kept out of the index (defense in depth alongside not
  // being listed in sitemap.ts) while still `follow`-able so link
  // equity passes through it normally, matching the Privacy Policy's
  // own metadata (src/app/privacy/page.tsx). Prompt 112.
  robots: { index: false, follow: true },
  alternates: { canonical: `${siteConfig.url}/terms` },
  ...buildSocialMetadata("Terms of Service — " + siteConfig.name, description, "/terms"),
};

/**
 * Every claim in this content array was checked against the actual
 * implementation as of Prompt 112 (see docs/TERMS_IMPLEMENTATION.md for
 * the section-by-section reasoning) — nothing here describes a service,
 * guarantee, or legal status that doesn't genuinely exist in this
 * codebase today. Where a real detail (a legal entity name, a
 * registered address, a governing law) isn't something this codebase
 * can determine on its own, that gap is stated plainly rather than
 * invented — see "Introduction" and "Contact Information" below.
 */
interface TermsSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

const SECTIONS: TermsSection[] = [
  {
    heading: "Introduction",
    paragraphs: [
      "These Terms of Service (\"Terms\") describe the rules for using Little Learners Learning (\"we,\" \"us,\" the \"platform\"), an early-years learning website for parents, teachers, and children ages 2–8.",
      "This page describes the platform's current, real functionality, based directly on how it's actually built — not generic template language. It has not been reviewed by a lawyer, and specific legal details this codebase has no way to determine on its own — such as the operating business's registered legal name, address, or the governing law that applies — are intentionally left for the platform's owner to add once finalized, rather than invented here.",
    ],
  },
  {
    heading: "Acceptance of Terms",
    paragraphs: [
      "By using this website, you agree to these Terms. If you don't agree with them, please don't use the site. If you're using the platform on behalf of a child, you're confirming that you're the child's parent or legal guardian, or otherwise authorized to make that decision for them.",
    ],
  },
  {
    heading: "Using Little Learners Learning",
    paragraphs: [
      "Little Learners Learning is intended for use by adults — parents and teachers — guiding a young child's learning, not for direct, unsupervised use by a child. The platform provides early-years learning content, printable-style resources, and simple browser-based games organized by subject.",
      "The platform is under active development. Not every one of its 16 subject areas has real content yet, and features described on this site may be added, changed, or removed as the platform grows — this page will be updated to reflect real changes, not to catch up with them after the fact.",
    ],
  },
  {
    heading: "Educational Content",
    paragraphs: [
      "The lessons, worksheets, activities, and other educational content on this site are provided to support a child's early learning at home or in the classroom. They are a supplement to, not a replacement for, your own judgment as a parent or teacher, or for professional educational, developmental, or medical advice where that's genuinely needed.",
      "We don't guarantee any specific learning outcome, developmental milestone, or academic result from using this platform. Every child learns differently, and how much a resource or activity helps depends on many things outside this platform's control.",
      "Religious content (Qur'an and Arabic learning material) is held to a stricter standard: it is only published after review by a qualified person, and categories where that review hasn't happened yet are shown honestly as not yet available, rather than filled with placeholder content.",
    ],
  },
  {
    heading: "Parent and Child Accounts",
    paragraphs: [
      "Creating a parent account lets you add a profile for your child (a name, age, and a few learning preferences — never more than a feature genuinely needs), track their real recorded activity on the platform, and manage applications on their behalf. A child does not have their own separate account or login — every child profile is managed by the parent account it belongs to.",
      "You're responsible for keeping your own account credentials (your password) secure, and for anything done through your account. If you believe your account has been accessed without your permission, please contact us using the information below.",
    ],
  },
  {
    heading: "Teacher Accounts and Profiles",
    paragraphs: [
      "A teacher account lets you build a professional profile (your experience, subjects, age groups, and areas of expertise) and, optionally, submit your own learning resources. You're responsible for the accuracy of the professional information you provide.",
      "Whether your profile appears in the public teacher directory depends on two things: a visibility setting you control yourself, and a moderation review — a profile is only listed in the searchable directory once it has been reviewed and approved, not automatically the moment you make it public.",
      "If you submit a resource as a teacher, you confirm that you have the right to share it, and you allow Little Learners Learning to display it on the platform for its intended educational purpose. A teacher-submitted resource is only shown publicly after it has been reviewed.",
    ],
  },
  {
    heading: "Applications and Admissions",
    paragraphs: [
      "The admissions area lets a parent start, save, and submit an application connected to their account and a specific child profile. Submitting an application generates a real, unique reference number you can use to look it up again.",
      "There is no live, automated admissions review process connected to this platform today. A submitted application stays at \"Submitted\" status honestly, rather than being shown as reviewed, accepted, or declined by a process that doesn't exist. Submitting an application is not a guarantee of admission, enrollment, or any other outcome.",
    ],
  },
  {
    heading: "Application Tracking",
    paragraphs: [
      "Once submitted, an application can be tracked from your own account — its real status, submission date, and status history are shown honestly, reflecting only what has actually happened to it, never an invented or estimated stage.",
    ],
  },
  {
    heading: "Games and Interactive Activities",
    paragraphs: [
      "The games on this platform are simple, browser-based activities built around a single learning goal each — never designed as open-ended entertainment. Each one states its intended age range and the skill it practices.",
      "Games are provided for educational and recreational use as-is. As with any screen-based activity, we encourage a parent or teacher to be involved in how and how long a young child uses them.",
    ],
  },
  {
    heading: "Digital Resources and Downloads",
    paragraphs: [
      "Resources on this platform (worksheets, activities, ebooks, and similar material) are shown with real descriptions, instructions, and learning objectives. Where a resource does not yet have a real, downloadable file attached, the page says so plainly (\"not available yet\") rather than presenting a download that doesn't work.",
      "Where a real downloadable file is provided, it's intended for personal, non-commercial use supporting your own child's or classroom's learning — not for resale or wider redistribution.",
    ],
  },
  {
    heading: "Intellectual Property",
    paragraphs: [
      "The Little Learners Learning name, logo, and platform-authored content (lessons, worksheets, activities, and similar material credited to \"Little Learners Learning\") belong to the platform. You may use them for your own personal or classroom educational purposes, but not republish, resell, or claim them as your own.",
      "Content a teacher submits under their own name remains theirs — submitting it to this platform doesn't transfer ownership, only the display license described above under \"Teacher Accounts and Profiles.\"",
    ],
  },
  {
    heading: "User Responsibilities",
    paragraphs: [
      "When using this platform, you agree to provide accurate information (for your own account, a child's profile, or a teacher profile), to use the site for its intended educational purpose, and to respect other users — including any teacher whose public profile you view.",
    ],
  },
  {
    heading: "Prohibited Uses",
    paragraphs: ["You agree not to:"],
    list: [
      "Use the platform for any unlawful purpose, or in a way that could harm the platform, other users, or children.",
      "Attempt to access another user's account, child profile, or application without permission.",
      "Attempt to bypass, probe, or interfere with the platform's security, including the administrative area.",
      "Upload, submit, or share content (including as a teacher) that is false, harmful, infringing, or inappropriate for an early-years education platform.",
      "Scrape, systematically copy, or resell the platform's content or data.",
      "Impersonate another person, including another parent, teacher, or an administrator.",
    ],
  },
  {
    heading: "Third-Party Services and Links",
    paragraphs: [
      "Real accounts, sign-in, and the data behind child profiles, teacher profiles, and applications are handled through Supabase, a backend service provider — this is the one real third-party service this platform's core account features depend on today.",
      "No payment processor is connected to this platform, and no purchase, subscription, or payment can currently be made here. No analytics or advertising service is actively collecting data on this site today (a dormant, unconfigured measurement system exists in the codebase but sends no data — see the Privacy Policy for the full explanation).",
      "Where this site links to an external page (for example, a mailto link to our contact address), we aren't responsible for the content or practices of sites we don't operate.",
    ],
  },
  {
    heading: "Privacy",
    paragraphs: [
      "How we handle information is described in full in our Privacy Policy, which forms part of these Terms. Please read it alongside this page.",
    ],
  },
  {
    heading: "Account Suspension or Termination",
    paragraphs: [
      "We reserve the right to suspend or restrict access to an account that violates these Terms, that we reasonably believe poses a risk to another user or a child, or where required for the platform's own security. Where practical, we'll try to explain why.",
      "You may stop using the platform, and ask us to remove information connected to your account, at any time by contacting us using the information below.",
    ],
  },
  {
    heading: "Website Availability",
    paragraphs: [
      "We aim to keep the platform available, but don't guarantee it will always be accessible, uninterrupted, or error-free. The platform is under active development, and features, content, and design may change as it grows.",
    ],
  },
  {
    heading: "Changes to These Terms",
    paragraphs: [
      "We may update these Terms as the platform's real functionality changes — for example, if a payment feature, a live admissions review process, or a new third-party service is ever connected. The effective date below reflects the most recent real update.",
    ],
  },
  {
    heading: "Contact Information",
    paragraphs: [
      `For any question about these Terms, contact ${siteConfig.email} — the same address published throughout this site, including the footer of every page. This is the only contact address these Terms use or refer to.`,
    ],
  },
];

const EFFECTIVE_DATE = "September 19, 2026";

function TermsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
        eyebrow="Legal"
        title="Terms of Service"
        description="The rules for using Little Learners Learning, based on what the platform actually does today."
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl">
          <Alert variant="info" title="About these terms" className="mb-10">
            These Terms describe Little Learners Learning&apos;s current, real
            functionality, based directly on how the platform is built today.
            They have not been reviewed by a lawyer, and may need review by a
            qualified legal professional — including for the platform&apos;s
            registered legal details and the governing law that applies —
            before this page is treated as final.
          </Alert>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <Heading level="h4" as="h2">
                  {section.heading}
                </Heading>
                <div className="mt-3 space-y-3 text-neutral-700">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                {section.list && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-700">
                    {section.list.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="border-t border-neutral-200 pt-8">
              <Heading level="h4" as="h2">
                Effective Date
              </Heading>
              <p className="mt-3 text-neutral-700">
                These Terms were last updated on {EFFECTIVE_DATE}.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default TermsPage;
