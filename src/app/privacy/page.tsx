import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/patterns/page-header";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "How Little Learners Learning collects, uses, and protects information, based on the platform's current functionality.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  // A policy page describes practices, it doesn't compete for search
  // traffic — kept out of the index (defense in depth alongside not
  // being listed in sitemap.ts) while still `follow`-able so link
  // equity passes through it normally. Prompt 108.
  robots: { index: false, follow: true },
  alternates: { canonical: `${siteConfig.url}/privacy` },
  ...buildSocialMetadata("Privacy Policy — " + siteConfig.name, description, "/privacy"),
};

/**
 * Every claim in this content array was checked against the actual
 * implementation as of Prompt 108 (see docs/PRIVACY_POLICY_IMPLEMENTATION.md
 * for the full source-by-source inspection) — nothing here describes a
 * service, data flow, or right that doesn't currently exist in this
 * codebase. When a real backend, analytics provider, or payment
 * processor is connected in the future, the relevant section below
 * needs a real update, not just a compliance-label change.
 */
interface PolicySection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

const SECTIONS: PolicySection[] = [
  {
    heading: "Introduction",
    paragraphs: [
      "Little Learners Learning (\"we,\" \"us\") is an early-years learning platform for parents, teachers, and children ages 2–8. This policy explains what information the platform actually collects today, why, and how it's handled — based on how the site is genuinely built, not a generic template.",
      "This policy describes the platform's current practices as implemented. It has not been reviewed by a lawyer, and it may need review by a qualified legal professional for the specific jurisdictions this platform ultimately operates in, especially as real user accounts, payments, or additional third-party services are connected in the future.",
    ],
  },
  {
    heading: "Information We Collect",
    paragraphs: [
      "Little Learners Learning is built to collect only what a specific feature you use actually needs. Most of what you enter on this site today is stored only in your own browser, not on a server we control — this is explained in more detail in \"Account and Application Information\" below.",
    ],
  },
  {
    heading: "Information You Provide",
    paragraphs: [
      "Depending on which parts of the site you use, you may choose to provide:",
    ],
    list: [
      "A child's first name, age, a chosen avatar icon, and optionally a favorite subject, if you add a child profile from the parent dashboard.",
      "Your name and email address, if you start creating a parent account, register as a teacher, or submit an application — sign-in itself isn't connected to a live account system yet (see \"Account and Application Information\"), so this information stays on your device rather than being sent to us, with one exception: if you complete and submit an application through the admissions wizard, the applicant name, email, phone number (optional), the child it's for, chosen learning interests, and any optional message you add are all stored, currently in your own browser only, the same as everything else described here.",
      "Professional details you choose to add to a teacher profile — a headline, bio, education, certifications, years of experience, age groups and subjects taught, languages, teaching interests, areas of expertise, and an optional profile photo.",
      "A message, name, and email if you use the site's contact address directly (see \"Contact Information\") — this goes through your own email provider, not through this website.",
      "Anything you type into the \"Ask about learning\" assistant — this runs entirely in your browser, does not save your conversation, and is never sent to us or to any third party (see \"Third-Party Services\").",
    ],
  },
  {
    heading: "Information Collected Automatically",
    paragraphs: [
      "The site does not currently run any analytics or tracking script that collects browsing behavior. A basic, provider-agnostic analytics system exists in the codebase but is not connected to any analytics service today, and sends no data anywhere unless and until that changes (see \"Third-Party Services\" and \"Cookies and Similar Technologies\").",
      "Like any website, the hosting infrastructure that serves these pages may log standard technical information (such as IP address, browser type, and request timestamps) as part of normal web server operation. This is infrastructure-level logging, not something this application's own code collects, stores, or has access to.",
    ],
  },
  {
    heading: "Children's Information",
    paragraphs: [
      "This platform is designed for parents and teachers to use on behalf of children, and it's built to avoid collecting more about a child than a feature genuinely needs:",
    ],
    list: [
      "A child profile stores only a first name, age, a chosen avatar icon, and an optional favorite subject — never a photo, contact detail, school, or other identifying information about the child themselves.",
      "Learning activity (which games or resources a child has opened, and real scores where a game produces one) is recorded only to power the \"what to try next\" feature on that child's own profile. It is stored on the parent's own device, never transmitted to us, and never displayed anywhere outside that browser.",
      "A child's information is only ever visible to whoever is using the same browser and device the profile was created on — there is no server-side account system today that would let this information be accessed from another device, by us, or by anyone else.",
      "The site does not knowingly collect information directly from a child, and there is no public page, directory, or feature anywhere on this site that displays a child's name or profile to other visitors.",
      "A parent can remove a child's information at any time by deleting it from the dashboard, or by clearing this site's data in their own browser (see \"Your Rights and Choices\").",
    ],
  },
  {
    heading: "How We Use Information",
    paragraphs: [
      "Information you provide is used only for the purpose you provided it for:",
    ],
    list: [
      "A child profile is used to personalize what's shown on that child's own dashboard and to power the \"what to try next\" suggestion, based only on that child's own recorded activity.",
      "A teacher profile is used to build the professional profile page you're creating, and — only once you set it to be visible and it has been reviewed — to appear in the teacher directory.",
      "An application's information is used to display your own submitted application and its status back to you when you track it.",
      "We do not use any information collected through this site to build advertising profiles, and the site does not run advertising of any kind.",
    ],
  },
  {
    heading: "How We Protect Information",
    paragraphs: [
      "Reasonable technical and organizational safeguards are used, appropriate to what the platform actually stores and where. We do not claim that any system is completely secure, 100% secure, or immune to every possible risk — no online service can honestly make that guarantee.",
    ],
    list: [
      "The one real account system on this platform, the administrative area used by our own team, is protected by a signed, time-limited session credential, a login attempt limit, and a server-side access check that runs before any administrative page is served.",
      "Because most information described in this policy is stored in your own browser rather than on a server we operate, it is not exposed by a data breach of our infrastructure in the way a centrally stored database would be — though it remains only as secure as the device and browser it's stored in.",
      "Uploaded files (such as a teacher profile photo) are checked against a file type and size allow-list before being accepted, and are stored the same way as other profile information — on your own device, not on a server.",
    ],
  },
  {
    heading: "When Information May Be Shared",
    paragraphs: [
      "We do not sell information collected through this site. Because most information described in this policy never reaches a server we control, there is currently very little for us to share even if we wanted to.",
      "The one exception is a submitted application or a message sent to our contact email address, both of which are reviewed by whoever administers this platform in order to respond to you. We do not share this information with unrelated third parties.",
      "If a real, server-backed account system, admissions review process, or payment feature is connected in the future, this section will need to be updated to reflect exactly who can access what at that point.",
    ],
  },
  {
    heading: "Third-Party Services",
    paragraphs: [
      "This section lists only services that are actually connected to the live site today, based on a direct check of the current configuration:",
    ],
    list: [
      "No analytics provider is connected. A generic analytics measurement system exists in the codebase, but it is inactive and sends no data until a specific provider is deliberately configured — this policy will be updated to name the provider if and when that happens.",
      "No payment processor is connected. There is no checkout, billing, or payment feature anywhere on this site today.",
      "No database or authentication service is actively storing your data. A connection to a backend authentication provider exists in the codebase in scaffold form only, is not configured, and is not used by any live feature — every sign-in and sign-up form on this site says so directly.",
      "The site's typefaces are served by Next.js's own font system, which downloads and hosts font files as part of the site itself rather than loading them from Google's servers at the time you visit — your browser does not make a separate request to a font provider when you view this site.",
    ],
  },
  {
    heading: "Cookies and Similar Technologies",
    paragraphs: [
      "This site uses one real cookie: a session cookie set only when someone signs in to the administrative area, used solely to keep that session signed in. It is not used for advertising or tracking, is not readable by page scripts, and is not set for ordinary visitors browsing the public site.",
      "The site also uses your browser's own local storage (a standard browser feature, technically distinct from a cookie) to remember information you enter — such as a child profile, a teacher profile, or an application draft — directly on your device between visits. This is what allows features like the parent dashboard to work without a live account system. You can clear this at any time through your browser's own settings, which will remove it completely.",
      "No advertising, cross-site tracking, or third-party cookie is set by this site today.",
    ],
  },
  {
    heading: "Data Retention",
    paragraphs: [
      "Information stored in your browser (child profiles, teacher profiles, applications, and similar records) remains there until you remove it yourself or clear your browser's site data — this platform has no server-side copy to separately delete or retain.",
      "The administrative activity log our own team can see is capped at a limited number of recent entries and is not kept as a permanent archive.",
    ],
  },
  {
    heading: "Your Rights and Choices",
    paragraphs: [
      "Because most of your information is stored on your own device rather than on a server we control, you already hold direct, immediate control over most of it:",
    ],
    list: [
      "You can view, edit, or delete a child profile, teacher profile, or application draft at any time directly from the relevant dashboard.",
      "You can remove everything this site has stored by clearing this site's data in your browser's settings.",
      "For anything not covered by the above — for example, a question about a submitted application, or a request related to information you've sent to our contact email — please write to us using the contact information below. Because there is no automated request-handling system connected to this site today, any such request is currently reviewed and handled manually rather than through an automated deletion, correction, or export tool.",
    ],
  },
  {
    heading: "Account and Application Information",
    paragraphs: [
      "Parent and teacher \"accounts\" on this platform work differently than on most sites, and it's worth being direct about it: signing up or signing in does not currently create a real, server-side account. Every sign-in and sign-up page on this site tells you this before you submit anything.",
      "What is real: once you're on a dashboard, adding a child profile, building a teacher profile, or filling out an application genuinely saves that information — in your own browser's local storage, tied to that browser and device, not to a login you can use elsewhere. Submitting an application does generate a real, unique reference number you can use to look up that same application again later, in the same browser.",
      "Because there is no live account system, there is currently no password to protect on our end for a parent or teacher account, and no cross-device sign-in to secure — the security considerations that matter today are the same ones that matter for any information stored on your own device.",
    ],
  },
  {
    heading: "Teacher Information",
    paragraphs: [
      "A teacher profile you build (name, email, country/region, and any professional details you choose to add) is stored on your own device, the same as other account-related information described above.",
      "Whether a profile is visible to other visitors is controlled by a visibility setting you choose yourself, and a profile is only ever listed in the public teacher directory after it has also passed a moderation check. A profile that hasn't opted into visibility, or hasn't been through moderation, is not shown publicly.",
      "Your account password, entered during teacher registration, is checked for basic format requirements and then discarded — it is never saved, by this site or anywhere else, because there is no live account system yet for it to authenticate against.",
    ],
  },
  {
    heading: "Contact Information",
    paragraphs: [
      `For any privacy question about this site, contact ${siteConfig.email} — the same address published throughout this site (including the footer of every page). This is the only contact address this policy uses or refers to.`,
    ],
  },
  {
    heading: "Changes to This Privacy Policy",
    paragraphs: [
      "This policy will be updated whenever a real change to what this platform collects or how it's handled actually happens — for example, if a real account backend, analytics provider, or payment processor is connected. The effective date below reflects the most recent update.",
    ],
  },
];

const EFFECTIVE_DATE = "September 19, 2026";

function PrivacyPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
        eyebrow="Legal"
        title="Privacy Policy"
        description="How Little Learners Learning collects, uses, and protects information, based on what the platform actually does today."
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl">
          <Alert variant="info" title="About this policy" className="mb-10">
            This policy describes Little Learners Learning&apos;s current, real
            practices, based directly on how the platform is built today. It
            has not been reviewed by a lawyer, and may need review by a
            qualified legal professional for jurisdiction-specific
            requirements as the platform grows.
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
                This policy was last updated on {EFFECTIVE_DATE}.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default PrivacyPage;
