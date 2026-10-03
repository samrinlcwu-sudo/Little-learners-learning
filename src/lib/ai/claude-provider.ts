import { siteConfig } from "@/config/site";
import type { AiAssistantProvider, AiMessage } from "./types";

const REQUEST_TIMEOUT_MS = 35_000;

const RATE_LIMITED_REPLY = "You're sending messages quickly — please wait a moment and try again.";
const UNAVAILABLE_REPLY = `Sorry, the assistant couldn't answer just now. You can still browse the subjects, resources, and games from the menu, use the search icon, or email ${siteConfig.email}.`;

function toMessage(content: string): AiMessage {
  return { id: crypto.randomUUID(), role: "assistant", content, createdAt: new Date().toISOString() };
}

/**
 * The real provider: a thin client for POST /api/assistant. The browser
 * never sees an API key and never talks to the AI vendor directly — the
 * server route owns both (src/app/api/assistant/route.ts). Failures become a
 * plain, honest assistant message rather than a thrown error, so the
 * conversation UI never needs its own error state and no upstream detail is
 * ever shown to a visitor. Only role + text of earlier turns are sent.
 */
export const claudeProvider: AiAssistantProvider = {
  id: "claude",
  isDevelopmentPlaceholder: false,
  async respond({ audience, message, history }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience,
          message,
          history: history.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });

      if (response.status === 429) return toMessage(RATE_LIMITED_REPLY);
      if (!response.ok) return toMessage(UNAVAILABLE_REPLY);

      const data: unknown = await response.json();
      const reply = typeof data === "object" && data !== null && "reply" in data ? (data as { reply: unknown }).reply : null;
      return toMessage(typeof reply === "string" && reply.trim() ? reply : UNAVAILABLE_REPLY);
    } catch {
      return toMessage(UNAVAILABLE_REPLY);
    } finally {
      clearTimeout(timer);
    }
  },
};
