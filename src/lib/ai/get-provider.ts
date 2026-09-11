import { devPlaceholderProvider } from "./dev-placeholder-provider";
import type { AiAssistantProvider } from "./types";

/**
 * Always the development placeholder today. When a real provider is
 * connected, this is the one function that changes — and the call has to
 * move server-side (a Next.js Route Handler, never this client-bundled
 * module) so an API key never ships to the browser. Every caller here
 * (use-ai-conversation.ts) keeps working unchanged either way, since both
 * return the same `AiAssistantProvider` shape.
 */
export function getAiAssistantProvider(): AiAssistantProvider {
  return devPlaceholderProvider;
}
