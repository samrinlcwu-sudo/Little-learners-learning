/**
 * Same honest-scaffolding shape as `isPaymentProviderConfigured`
 * (`src/lib/payments/is-configured.ts`): a generic, provider-agnostic
 * variable name — not `NEXT_PUBLIC_GA_ID` or any other specific vendor's
 * own name — so whichever privacy-conscious provider is actually chosen
 * later (Plausible, Fathom, Vercel Analytics, or similar) fills this in
 * without renaming anything. A function (not a module-load-time constant)
 * so it re-reads `process.env` on every call — real, tested behavior
 * rather than a value frozen at import time. Unset by default, which
 * keeps `trackEvent()` (`./track.ts`) a real no-op today rather than
 * silently sending data nobody configured. See
 * docs/SEARCH_MONITORING_PLAN.md for the reasoning behind not picking or
 * wiring a specific vendor in this pass.
 */
export function isAnalyticsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_ANALYTICS_ID);
}
