/**
 * Whether real admin authentication (Prompt 57, docs/ADMIN_ARCHITECTURE.md)
 * is actually connected on this deployment — the same honesty pattern
 * `isSupabaseConfigured()` (src/lib/supabase/is-configured.ts) already
 * established: check real env vars, never assume. Both are server-only
 * (never `NEXT_PUBLIC_`-prefixed) on purpose — `ADMIN_PASSPHRASE` is the
 * shared secret an admin types in; `ADMIN_SESSION_SECRET` signs the
 * session cookie. Neither should ever reach a browser bundle.
 */
export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSPHRASE && process.env.ADMIN_SESSION_SECRET);
}
