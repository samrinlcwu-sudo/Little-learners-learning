import { isAnalyticsConfigured } from "./is-configured";
import type { AnalyticsEventName, AnalyticsEventProperties } from "./types";

/**
 * The one real integration point every call site in this codebase uses —
 * none of them talk to a provider directly, so connecting a real one later
 * is a change in this file alone.
 *
 * Today `isAnalyticsConfigured` is always `false` (no
 * `NEXT_PUBLIC_ANALYTICS_ID` is set anywhere in this repository), so this
 * is a genuine no-op: no network request, no third-party script, no data
 * sent anywhere. That's deliberate — this prompt's brief is to prepare a
 * clean integration point, not to pick a vendor and start sending real
 * visitors' data to it without that being an explicit product decision.
 * See docs/SEARCH_MONITORING_PLAN.md for the recommended next step.
 *
 * When a provider *is* connected, this function is where its call goes —
 * e.g. `window.plausible?.(name, { props: properties })` for Plausible, or
 * nothing at all if Vercel Analytics's own `<Analytics />` component is
 * used instead (it auto-tracks page views and exposes its own `track()`
 * for custom events, which would replace this function's body, not wrap
 * it). Whichever is chosen, every call site below stays unchanged.
 */
export function trackEvent(name: AnalyticsEventName, properties?: AnalyticsEventProperties): void {
  if (!isAnalyticsConfigured()) return;
  if (typeof window === "undefined") return;

  // Intentionally unreachable until a provider is connected — see the
  // comment above. Kept as a single, obvious spot to fill in rather than
  // deleted, so "where does this go" is never a question later.
  void name;
  void properties;
}
