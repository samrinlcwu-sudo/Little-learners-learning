/**
 * Contracts for the future AI Learning Assistant — no external provider is
 * connected yet (see docs/AI_ASSISTANT_ARCHITECTURE.md). Defining the shape
 * now lets the UI, permissions, and a real provider all be built against a
 * stable interface later, the same "prepared architecture, not simulated"
 * pattern already used for teacher moderation and resource review.
 */

/**
 * Who is actually asking. Deliberately distinct from `AccountRole`
 * (src/lib/accounts/types.ts) — "public" (no account at all) and "child"
 * (a profile, never its own account, per that file's own comment) are both
 * real audiences the assistant must reason about even though neither is an
 * `AccountRole`. "admin" is carried through for the same reason
 * `AccountRole` already carries it: the type system should account for it
 * before any admin UI exists, not after.
 */
export type AiAudience = "public" | "parent" | "child" | "teacher" | "admin";

export type AiMessageRole = "user" | "assistant";

export interface AiMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
}

export interface AiAssistantRequest {
  audience: AiAudience;
  message: string;
  /** Prior turns in this session only — never a cross-session history, since none is stored (see use-ai-conversation.ts). */
  history: AiMessage[];
}

/**
 * What a provider hands back. `isDevelopmentPlaceholder` is load-bearing,
 * not decorative — the UI uses it to keep the "Development preview" badge
 * honest, and it must stay `true` until a real provider actually answers.
 */
export interface AiAssistantProvider {
  readonly id: string;
  readonly isDevelopmentPlaceholder: boolean;
  respond(request: AiAssistantRequest): Promise<AiMessage>;
}
