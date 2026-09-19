"use client";

import { trackEvent } from "@/lib/analytics/track";

export interface ContactMailtoLinkProps {
  email: string;
  className?: string;
}

/**
 * The one real, working "contact" action anywhere on this site — the
 * support page's own form is intentionally disabled (`src/app/support/
 * page.tsx`: "sending is disabled for now"), so there is no real "contact
 * form submitted" moment to measure yet. This mailto link is the genuine
 * equivalent: clicking it actually opens the visitor's email client. Kept
 * as its own small client component so `SiteFooter` — otherwise a plain
 * server component — doesn't need `"use client"` just for this one
 * handler. See docs/SEARCH_MONITORING_PLAN.md, "Important events."
 */
function ContactMailtoLink({ email, className }: ContactMailtoLinkProps) {
  return (
    <a href={`mailto:${email}`} className={className} onClick={() => trackEvent("contact_initiated")}>
      {email}
    </a>
  );
}

export { ContactMailtoLink };
