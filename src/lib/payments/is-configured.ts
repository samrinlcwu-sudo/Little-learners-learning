/**
 * Whether a real payment provider is wired up. Mirrors
 * src/lib/supabase/is-configured.ts's exact reasoning: no provider is
 * connected today, so this is always `false`, and every future payment
 * code path must check it and fail closed — never process a payment,
 * never fake a success — the same way admin auth fails closed when its
 * own env vars are unset (src/lib/admin/session.ts).
 *
 * Deliberately a function rather than a module-level constant (unlike
 * `isSupabaseConfigured`): a function re-reads `process.env` on every
 * call, which is what makes this testable without module-reload tricks,
 * and costs nothing extra since nothing calls this on a hot path today.
 *
 * `PAYMENT_PROVIDER_ID` and `PAYMENT_PROVIDER_SECRET_KEY` are
 * deliberately generic names, not a specific provider's own variable
 * names (never `STRIPE_SECRET_KEY` or similar) — keeping this check
 * itself provider-independent. Both are server-only and must never carry
 * the `NEXT_PUBLIC_` prefix; the secret's value is never read here, only
 * checked for presence.
 */
export function isPaymentProviderConfigured(): boolean {
  return Boolean(process.env.PAYMENT_PROVIDER_ID && process.env.PAYMENT_PROVIDER_SECRET_KEY);
}
