import type { AiAudience } from "./types";

/**
 * What each audience may be helped with. Every flag here maps to a real
 * boundary already enforced elsewhere in the app (a parent only ever sees
 * their own children — src/lib/accounts/local-children.ts; a browser holds
 * at most one teacher account — src/lib/accounts/local-teacher.ts) so the
 * assistant's future answers can never reach across those same boundaries.
 * `mayAccessAssistant` is the gate the entry point itself reads
 * (src/components/patterns/ai-assistant.tsx) — false for "child" and
 * "admin" is a deliberate Prompt 46 decision, not an oversight: a chat
 * surface aimed at young children needs stronger guardrails than "prepared
 * architecture" can promise before a real provider and real moderation
 * exist, and no admin UI exists at all yet (matching `AccountRole`'s own
 * "admin" precedent in src/lib/accounts/types.ts).
 */
export interface AiAudiencePermissions {
  /** Subjects, resources, games, how the platform works — safe for anyone to ask. */
  mayDiscussPublicContent: boolean;
  /** A parent's own child's real progress/activity — never another family's. */
  mayDiscussOwnChildProgress: boolean;
  /** A teacher's own profile/resources — never another teacher's. */
  mayDiscussOwnTeacherAccount: boolean;
  /** Whether the assistant entry point should even be shown to this audience today. */
  mayAccessAssistant: boolean;
}

export const AI_AUDIENCE_PERMISSIONS: Record<AiAudience, AiAudiencePermissions> = {
  public: {
    mayDiscussPublicContent: true,
    mayDiscussOwnChildProgress: false,
    mayDiscussOwnTeacherAccount: false,
    mayAccessAssistant: true,
  },
  parent: {
    mayDiscussPublicContent: true,
    mayDiscussOwnChildProgress: true,
    mayDiscussOwnTeacherAccount: false,
    mayAccessAssistant: true,
  },
  teacher: {
    mayDiscussPublicContent: true,
    mayDiscussOwnChildProgress: false,
    mayDiscussOwnTeacherAccount: true,
    mayAccessAssistant: true,
  },
  child: {
    mayDiscussPublicContent: true,
    mayDiscussOwnChildProgress: false,
    mayDiscussOwnTeacherAccount: false,
    mayAccessAssistant: false,
  },
  admin: {
    mayDiscussPublicContent: true,
    mayDiscussOwnChildProgress: false,
    mayDiscussOwnTeacherAccount: false,
    mayAccessAssistant: false,
  },
};
