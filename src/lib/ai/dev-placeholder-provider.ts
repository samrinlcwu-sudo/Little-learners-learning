import type { AiAssistantProvider, AiAudience } from "./types";

/**
 * A fixed, clearly-labeled reply per audience — never generated from the
 * user's actual message. Real-sounding, input-aware placeholder text would
 * risk being mistaken for a working AI system; a canned, identical-every-time
 * reply cannot be, which is the whole point of this provider until a real
 * one exists (see docs/AI_ASSISTANT_ARCHITECTURE.md).
 */
const PLACEHOLDER_REPLIES: Record<AiAudience, string> = {
  public: "Thanks for asking! The Little Learners Assistant isn't connected to a real AI yet — this is a development placeholder. Once it's live, this is where you'll get help finding the right subject, resource, or game.",
  parent: "Thanks for asking! The Little Learners Assistant isn't connected to a real AI yet — this is a development placeholder. Once it's live, this is where you'll get help understanding your child's learning journey and finding what to try next.",
  teacher: "Thanks for asking! The Little Learners Assistant isn't connected to a real AI yet — this is a development placeholder. Once it's live, this is where you'll get help planning activities and finding resources to share.",
  child: "This assistant isn't available here yet.",
  admin: "This assistant isn't available here yet.",
};

/**
 * Always today's only provider — no external AI is connected
 * (docs/AI_ASSISTANT_ARCHITECTURE.md). Fulfils AiAssistantProvider so a real
 * provider can be swapped in later without any caller changing.
 */
export const devPlaceholderProvider: AiAssistantProvider = {
  id: "dev-placeholder",
  isDevelopmentPlaceholder: true,
  async respond({ audience }) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: PLACEHOLDER_REPLIES[audience],
      createdAt: new Date().toISOString(),
    };
  },
};
