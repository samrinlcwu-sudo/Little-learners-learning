/**
 * Whether a real Supabase project is wired up. Both are `NEXT_PUBLIC_*`
 * values, so this check is safe to run in the browser — it never touches
 * `SUPABASE_SERVICE_ROLE_KEY` or any other server-only secret.
 *
 * Every auth form checks this before attempting a real request, so the
 * exact same form code starts working the day real credentials are filled
 * into `.env.local` — nothing else needs to change.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
