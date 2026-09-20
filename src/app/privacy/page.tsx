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
 * Originally written as of Prompt 108
 * (see docs/PRIVACY_POLICY_IMPLEMENTATION.md for the full
 * source-by-source inspection), before the real Supabase backend
 * (Prompt 110) existed. Corrected during Vercel deployment prep to
 * reflect that accounts, child profiles, teacher profiles, and
 * applications are now stored in a real, Supabase-backed account —
 * not only in the visitor's own browser — per
 * docs/FINAL_LAUNCH_REPORT.md's finding that this page had drifted out
 * of sync with the Terms of Service on that exact point. Nothing here
 * describes a service, data flow, or right that doesn't currently
 * exist in this codebase, and no compliance label (GDPR/COPPA/etc.) or
 * legal/jurisdiction detail was added. When an analytics provider or
 * payment processor is connected in the future, the relevant section
 * below still needs a real update, not just a compliance-label change.
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
      "This policy describes the platform's current practices as implemented. It has not been reviewed by a lawyer, and it may need review by a qualified legal professional for the specific jurisdictions this platform ultimately operates in, especially as payments or additional third-party services are connected in the future.",
    ],
  },
  {
    heading: "Information We Collect",
    paragraphs: [
      "Little Learners Learning is built to collect only what a specific feature you use actually needs. Account, profile, and application information is stored in your real account with our authentication and database provider, Supabase; a smaller set of purely on-device information (such as a child's recorded learning activity) stays only in your own browser — this is explained in more detail in \"Account and Application Information\" below.",
    ],
  },
  {
    heading: "Information You Provide",
    paragraphs: [
      "Depending on which parts of the site you use, you may choose to provide:",
    ],
    list: [
      "A child's first name, age, a chosen avatar icon, and optionally a favorite subject, if you add a child profile from the parent dashboard.",
      "Your name and email address, if you create a parent account or register as a teacher — this information is sent securely to Supabase, our authentication and database provider, and stored in your real account (see \"Account and Application Information\"). If you complete and submit an application through the admissions wizard, the applicant name, email, phone number (optional), the child it's for, chosen learning interests, and any optional message you add are stored the same way, in your account.",
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
      "A child's profile is stored in your account with Supabase, our database provider, protected by database-level access rules that restrict it to your own account — it is accessible to you from any device you sign in from, and is not visible to another parent's account.",
      "The site does not knowingly collect information directly from a child, and there is no public page, directory, or feature anywhere on this site that displays a child's name or profile to other visitors.",
      "A parent can remove a child's profile at any time by deleting it from the dashboard, which removes it from your account. A child's on-device learning activity (see above) can separately be cleared by clearing this site's data in your own browser (see \"Your Rights and Choices\").",
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
      "The administrative area used by our own team is protected by a signed, time-limited session credential, a login attempt limit, and a server-side access check that runs before any administrative page is served.",
      "Your account password is never stored, logged, or visible to this application's own code at any point — when you sign up or sign in, it is sent directly to Supabase, our authentication provider, over an encrypted connection, and Supabase's own service is what stores and verifies it.",
      "Every account-linked record (a child profile, a teacher profile, an application) is protected by database-level access rules (Row Level Security) that restrict it to the account that owns it, enforced by the database itself rather than by this application's own code alone.",
      "Uploaded files (such as a teacher profile photo) are checked against a file type and size allow-list before being accepted, and are stored the same way as other profile information described above.",
    ],
  },
  {
    heading: "When Information May Be Shared",
    paragraphs: [
      "We do not sell information collected through this site. Account, profile, and application information is stored with Supabase, our authentication and database provider, which processes it only on our behalf and under our instructions — it is not an independent third party we share your information with for its own purposes.",
      "The one exception is a submitted application or a message sent to our contact email address, both of which are reviewed by whoever administers this platform in order to respond to you. We do not share this information with unrelated third parties.",
      "If a real, automated admissions review process or a payment feature is connected in the future, this section will need to be updated to reflect exactly who can access what at that point.",
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
      "Supabase is our real, connected authentication and database provider. It's what makes account sign-up, sign-in, child profiles, teacher profiles, and applications work — your account credentials, profile information, and application details are stored in Supabase's infrastructure on our behalf, protected by database-level access rules that restrict every record to the account that owns it.",
      "The site's typefaces are served by Next.js's own font system, which downloads and hosts font files as part of the site itself rather than loading them from Google's servers at the time you visit — your browser does not make a separate request to a font provider when you view this site.",
    ],
  },
  {
    heading: "Cookies and Similar Technologies",
    paragraphs: [
      "This site uses cookies for two real, functional purposes — never for advertising or tracking: one set only when someone signs in to the administrative area, used solely to keep that session signed in; and one or more set by Supabase, our authentication provider, when a parent or teacher signs in, used to keep that account session signed in. Neither is readable by page scripts, and neither is set for a visitor who never signs in.",
      "Once you're signed in, your child profiles, teacher profile, and applications are stored in your Supabase-backed account, not in your browser's local storage — clearing your browser's site data will not delete this information, since it's kept by our authentication provider, scoped to your account (see \"Data Retention\" and \"Your Rights and Choices\"). Your browser's local storage may still be used for a small number of non-account conveniences, such as a child's recorded learning activity on that device (see \"Children's Information\").",
      "No advertising, cross-site tracking, or third-party cookie is set by this site today.",
    ],
  },
  {
    heading: "Data Retention",
    paragraphs: [
      "Child profiles, teacher profiles, and applications are stored in your account with Supabase, our database provider, and remain there until you remove them yourself from the relevant dashboard or ask us to delete your account (see \"Your Rights and Choices\") — clearing your browser's local site data does not delete this information.",
      "The administrative activity log our own team can see is capped at a limited number of recent entries and is not kept as a permanent archive.",
    ],
  },
  {
    heading: "Your Rights and Choices",
    paragraphs: [
      "You have direct control over most of your account information, and a manual option for anything you can't change yourself:",
    ],
    list: [
      "You can view, edit, or delete a child profile or teacher profile at any time directly from the relevant dashboard — these changes are saved to your real account.",
      "To delete your account, or to request a copy of what's stored in it, contact us using the information below. There is no automated self-service deletion or export tool today, so this is currently handled manually rather than instantly.",
      "For anything else — for example, a question about a submitted application, or a request related to information you've sent to our contact email — please write to us using the contact information below. Because there is no automated request-handling system connected to this site today, any such request is currently reviewed and handled manually rather than through an automated deletion, correction, or export tool.",
    ],
  },
  {
    heading: "Account and Application Information",
    paragraphs: [
      "Parent and teacher accounts on this platform are real: signing up creates a genuine account with Supabase, our authentication and database provider, and signing in establishes a real, secure session tied to that account.",
      "Once you're signed in, adding a child profile, building a teacher profile, or filling out an application genuinely saves that information to your account — accessible from any device you sign in from, not just the one you created it on. Submitting an application generates a real, unique reference number you can use to look up that same application again later, from your account.",
      "Your account password is sent directly to Supabase and is never stored, logged, or visible to this application's own code at any point — Supabase's own service is what stores and verifies it. A database-level access rule (Row Level Security) restricts every child profile, teacher profile, and application record to the account that owns it, enforced by the database itself.",
    ],
  },
  {
    heading: "Teacher Information",
    paragraphs: [
      "A teacher profile you build (name, email, country/region, and any professional details you choose to add) is stored in your account with Supabase, our database provider, the same as other account-related information described above.",
      "Whether a profile is visible to other visitors is controlled by a visibility setting you choose yourself, and a profile is only ever listed in the public teacher directory after it has also passed a moderation check. A profile that hasn't opted into visibility, or hasn't been through moderation, is not shown publicly — and the public directory never displays your email address.",
      "Your account password, entered during teacher registration, is sent directly to Supabase, our authentication provider — it is never stored, logged, or visible to this application's own code; Supabase's own service is what stores and verifies it for future sign-ins.",
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
      "This policy will be updated whenever a real change to what this platform collects or how it's handled actually happens — for example, if an analytics provider or payment processor is connected. The effective date below reflects the most recent update.",
    ],
  },
];

const EFFECTIVE_DATE = "September 20, 2026";

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
