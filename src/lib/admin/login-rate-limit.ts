/**
 * A minimal brute-force throttle for the admin passphrase check
 * (`adminLoginAction`, src/lib/admin/actions.ts) — before this, a script
 * could submit unlimited passphrase guesses with no penalty at all, the
 * only defense being the passphrase's own strength. This closes that gap
 * the way the rest of this codebase's security already works: honestly,
 * with no infrastructure this project doesn't have.
 *
 * In-memory and process-global, not per-IP or per-session — matching
 * `verifyAdminPassphrase`'s own model of a single shared admin identity
 * rather than a multi-admin table (docs/ADMIN_ARCHITECTURE.md). Real
 * limitations, stated plainly rather than glossed over:
 * - Resets on server restart or a fresh serverless cold start — this is
 *   a best-effort throttle, not a durable, cross-instance lockout that
 *   would require an external store (Redis, a database) this project
 *   doesn't have.
 * - It's global, not per-caller: five wrong guesses from anyone locks out
 *   everyone for the cooldown window, including the real admin. That's
 *   the deliberate trade-off of a single-shared-passphrase system with no
 *   per-admin identity to throttle separately.
 * Still a real, meaningful improvement over the previous unlimited-attempts
 * state, and requires no new dependency or external service.
 */
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

let failedAttempts = 0;
let lockedUntil = 0;

export function isLoginLocked(): boolean {
  return Date.now() < lockedUntil;
}

export function getLockoutRemainingMinutes(): number {
  return Math.max(1, Math.ceil((lockedUntil - Date.now()) / 60000));
}

export function recordFailedLoginAttempt(): void {
  failedAttempts += 1;
  if (failedAttempts >= MAX_ATTEMPTS) {
    lockedUntil = Date.now() + LOCKOUT_MS;
    failedAttempts = 0;
  }
}

export function recordSuccessfulLogin(): void {
  failedAttempts = 0;
  lockedUntil = 0;
}

/** Test-only: put the module back to its fresh-process state between tests. */
export function _resetForTests(): void {
  failedAttempts = 0;
  lockedUntil = 0;
}
