"use client";

import * as React from "react";
import { getAiAssistantProvider } from "./get-provider";
import type { AiAudience, AiMessage } from "./types";

/**
 * In-memory only, on purpose — no backend exists to store this safely, and
 * a chat transcript is exactly the kind of thing that shouldn't sit in
 * localStorage indefinitely by default (unlike a child's name or a
 * teacher's profile, which the family/teacher themselves chose to save).
 * Switching audience (leaving the page this conversation belonged to)
 * starts a fresh session rather than carrying context across roles.
 */
export function useAiConversation(audience: AiAudience) {
  const [messages, setMessages] = React.useState<AiMessage[]>([]);
  const [sending, setSending] = React.useState(false);
  const provider = getAiAssistantProvider();

  // Reset during render rather than in an effect — the recommended way to
  // adjust state when a prop changes (https://react.dev/learn/you-might-not-need-an-effect).
  const [trackedAudience, setTrackedAudience] = React.useState(audience);
  if (audience !== trackedAudience) {
    setTrackedAudience(audience);
    setMessages([]);
  }

  const sendMessage = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const userMessage: AiMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setSending(true);
      try {
        const reply = await provider.respond({ audience, message: trimmed, history: messages });
        setMessages((prev) => [...prev, reply]);
      } finally {
        setSending(false);
      }
    },
    [audience, messages, provider, sending],
  );

  return { messages, sending, sendMessage, isDevelopmentPlaceholder: provider.isDevelopmentPlaceholder };
}
