# Terms Implementation

How the real Terms of Service at `/terms` (`src/app/terms/page.tsx`)
was built — a direct inspection of what this codebase actually does,
done before a single sentence of the Terms was written, following the
exact same method used for the Privacy Policy
(`docs/PRIVACY_POLICY_IMPLEMENTATION.md`, Prompt 108).

## Terms Page Location

`/terms` (`src/app/terms/page.tsx`) — the existing route, updated in
place. It previously showed a "not yet written" placeholder
(`ComingSoonSection`); that placeholder is now replaced with real
content. No new route was created, and the canonical URL, page
structure (`PageHeader` → `Alert` → sectioned content → effective
date), and design tokens are identical to the Privacy Policy's own
page, so the two read as one consistent pair rather than two different
designs.

## Sections Included

All 20 sections requested, each checked against real functionality
before being written:

1. **Introduction** — states plainly that a registered legal entity
   name, address, and governing law aren't something this codebase can
   determine, and are left for the platform's owner to add.
2. **Acceptance of Terms**
3. **Using Little Learners Learning** — states the platform is for
   adults guiding a child's learning, not direct child use, and that
   it's under active development.
4. **Educational Content** — no learning-outcome guarantee is made;
   religious content's stricter review standard is stated honestly.
5. **Parent and Child Accounts** — reflects the real, current
   architecture (Prompt 110): a child has no separate account; a
   parent's own account credentials are their responsibility.
6. **Teacher Accounts and Profiles** — the real two-gate visibility
   model (a teacher's own visibility setting, plus a real moderation
   review) is described accurately, matching
   `src/lib/accounts/teacher-visibility.ts`.
7. **Applications and Admissions** — states plainly that no live,
   automated review process exists, and that a submission is not a
   guarantee of any outcome.
8. **Application Tracking** — describes the real, honest status/history
   tracking that exists today.
9. **Games and Interactive Activities**
10. **Digital Resources and Downloads** — states the real "not
    available yet" behavior for every resource without a real
    `downloadFile` (which, as of this writing, is every resource on the
    platform).
11. **Intellectual Property** — covers both platform-authored content
    and teacher-submitted content (which remains the teacher's own,
    under a display license).
12. **User Responsibilities**
13. **Prohibited Uses**
14. **Third-Party Services and Links** — names Supabase specifically,
    since it is the one real third-party service core account features
    depend on today (Prompt 110); states plainly that no payment
    processor and no active analytics/advertising service exist.
15. **Privacy** — points to the real Privacy Policy rather than
    duplicating it.
16. **Account Suspension or Termination** — written as a standard
    policy/rights-reserved clause (a normal, expected Terms provision),
    not as a claim about a specific automated enforcement mechanism —
    see "Assumptions Intentionally Avoided" below for why that
    distinction matters here.
17. **Website Availability**
18. **Changes to These Terms**
19. **Contact Information** — the one real, existing address
    (`siteConfig.email`), the same one already used throughout the
    site and in the Privacy Policy.
20. **Effective Date**

## Footer Integration

No change was needed. `src/config/nav.ts` already listed
`{ label: "Terms of Service", href: "/terms" }` in the footer's
"Support" group, added long before this prompt — the link already
worked, it simply pointed at a placeholder page. Verified live this
pass: the footer link's `href` resolves to `/terms`, and the updated
page loads correctly when reached that way, on both desktop and at
375px mobile width (no horizontal overflow).

## Legal Details Still Requiring Owner Review

Stated plainly in the page itself (the "About these terms" notice and
the Introduction section), not hidden:

1. **No lawyer has reviewed this page.** It describes real, current
   technical behavior, not a vetted legal position.
2. **The operating business's registered legal name, address, and the
   governing law/jurisdiction that applies** are not present anywhere
   in this codebase and were not invented for this page. These need to
   be added by whoever owns the business once determined.
3. **Age-related legal requirements specific to a jurisdiction** (e.g.
   whether a minimum parent/account-holder age needs to be stated
   explicitly for a specific country) haven't been evaluated — this
   page states the platform is for adults acting on a child's behalf,
   but doesn't attempt a jurisdiction-specific age-of-majority claim.
4. **Dispute resolution / arbitration clauses**, common in many
   commercial Terms of Service, were not added — this codebase has no
   existing practice to describe here, and inventing one would be
   exactly the "fake legal language" this prompt's own instructions
   rule out.

## Assumptions Intentionally Avoided

- **No GDPR, COPPA, FERPA, or other compliance claim** appears
  anywhere on this page, per this prompt's explicit instruction —
  matching the same rule already followed in the Privacy Policy.
- **No refund, payment, or subscription policy** was written, since no
  payment feature exists anywhere in this codebase (confirmed by
  checking `src/lib/payments/is-configured.ts`, which is unconfigured
  everywhere, and the absence of any checkout UI).
- **No certification, accreditation, or guarantee** of any kind is
  claimed — "Educational Content" explicitly states no learning
  outcome is guaranteed.
- **"Account Suspension or Termination" was written carefully as a
  policy clause, not a technical-capability claim.** A real, working
  `accountStatus` field exists on child and teacher profiles, but
  Prompt 110's own audit (`docs/AUTHENTICATION_BACKEND_AUDIT.md`,
  "Remaining Limitations") documents that there is currently no real
  admin-side path to change that field for a genuine Supabase-backed
  account (a database trigger locks it against ordinary updates, and
  no service-role admin route exists yet). A Terms of Service
  reserving the right to suspend an account for a violation is
  standard, expected language describing what the operator may do —
  it does not claim a specific technical mechanism already exists to
  do it instantly, the same distinction any real company's Terms page
  makes between a stated policy and its enforcement details.
- **No specific data-retention period or automated deletion timeline**
  was stated in the "Privacy" section — it defers entirely to the real
  Privacy Policy rather than restating (and risking contradicting) it.

## SEO Implementation

- **Title**: "Terms of Service" (falls through to the site's title
  template, matching every other page).
- **Meta description**: a real, specific one-sentence summary — "The
  terms for using Little Learners Learning, based on the platform's
  current functionality." — not a generic template line.
- **Canonical URL**: `${siteConfig.url}/terms`, via `alternates.canonical`,
  identical pattern to every other page on the site.
- **Open Graph / social metadata**: generated through the existing
  `buildSocialMetadata()` helper (`src/lib/seo/social-metadata.ts`),
  the same function every other page already uses — no new metadata
  system was introduced.
- **Robots**: `{ index: false, follow: true }` — kept out of search
  results (a Terms page isn't a landing page to rank, and its content
  duplicates the Privacy Policy's own "not indexed" treatment for the
  same reason), while still `follow`-able so link equity passes through
  normally. Matches the Privacy Policy's own robots directive exactly.
- **No keyword stuffing**: the page is written in plain, direct
  language for a parent or teacher to actually read, not optimized for
  search terms.

## Testing Performed

- Read the live page at `/terms` end to end (`get_page_text`) and
  confirmed all 20 sections render in the correct order with the
  correct content.
- Verified the "About these terms" disclaimer renders using the same
  `Alert` component and placement as the Privacy Policy's own
  disclaimer.
- Checked mobile at 375px width via `scrollWidth`/`clientWidth`: no
  horizontal overflow.
- Confirmed the existing footer "Terms of Service" link
  (`src/config/nav.ts`, unchanged) resolves to `/terms` and the updated
  page loads correctly.
- Confirmed `/privacy` still loads correctly and independently — this
  pass touched no Privacy Policy code or content.
- Checked the browser console for real runtime errors on both
  `/terms` and `/privacy` — none found (only expected dev-mode HMR
  websocket messages, unrelated to this change).
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `npx vitest run` — full suite passing; no test needed updating for a
  content-only page, and no existing test was weakened or removed.
- `rm -rf .next && npx next build` — clean production build.
