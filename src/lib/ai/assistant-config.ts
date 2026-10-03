/**
 * Limits and switches for the real (Claude-backed) assistant. Everything here
 * exists to bound cost and abuse on a public, anonymous endpoint — see
 * docs/AI_ASSISTANT_ARCHITECTURE.md, "Real provider."
 */

export const ASSISTANT_MODEL = "claude-sonnet-5";
export const ASSISTANT_MAX_OUTPUT_TOKENS = 500;

export const ASSISTANT_MAX_MESSAGE_CHARS = 500;
export const ASSISTANT_MAX_HISTORY_MESSAGES = 6;
export const ASSISTANT_MAX_HISTORY_MESSAGE_CHARS = 1500;
export const ASSISTANT_MAX_REQUEST_BYTES = 20_000;

/** Per network address, per server instance — best-effort, not a global cap (see rate-limit.ts). */
export const ASSISTANT_RATE_LIMIT = { maxRequests: 20, windowMs: 10 * 60 * 1000 } as const;

/**
 * The one public switch. `NEXT_PUBLIC_` so the same value decides both which
 * provider the browser uses and whether the server route answers at all — a
 * function, not a constant, so it re-reads `process.env` per call (testable)
 * and still inlines at build time in the client bundle. Off unless set to
 * exactly "true", which keeps the honest development placeholder active.
 */
export function isAssistantEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_ASSISTANT_ENABLED === "true";
}
