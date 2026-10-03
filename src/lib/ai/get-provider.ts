import { isAssistantEnabled } from "./assistant-config";
import { claudeProvider } from "./claude-provider";
import { devPlaceholderProvider } from "./dev-placeholder-provider";
import type { AiAssistantProvider } from "./types";

/**
 * The real, Claude-backed provider when `NEXT_PUBLIC_AI_ASSISTANT_ENABLED`
 * is "true"; otherwise the honest development placeholder, exactly as
 * before. The real provider never holds a key — it calls our own server
 * route (src/app/api/assistant/route.ts), so this module stays safe to
 * bundle into the browser. Every caller (use-ai-conversation.ts) is
 * unchanged either way: both return the same `AiAssistantProvider` shape.
 */
export function getAiAssistantProvider(): AiAssistantProvider {
  return isAssistantEnabled() ? claudeProvider : devPlaceholderProvider;
}
