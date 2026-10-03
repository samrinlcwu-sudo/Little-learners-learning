import { z } from "zod";
import {
  ASSISTANT_MAX_HISTORY_MESSAGES,
  ASSISTANT_MAX_HISTORY_MESSAGE_CHARS,
  ASSISTANT_MAX_MESSAGE_CHARS,
} from "./assistant-config";

/**
 * The wire contract for POST /api/assistant. Deliberately only `audience`,
 * `message`, and prior `history` turns (role + text) — no child id, no
 * account id, no progress data. The server builds all context itself from
 * public site content, so there is nothing private for a client to send.
 */
export const assistantRequestSchema = z.object({
  audience: z.enum(["public", "parent", "teacher", "child", "admin"]),
  message: z.string().trim().min(1).max(ASSISTANT_MAX_MESSAGE_CHARS),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(ASSISTANT_MAX_HISTORY_MESSAGE_CHARS),
      }),
    )
    .max(50)
    .default([]),
});

export type AssistantRequestBody = z.infer<typeof assistantRequestSchema>;

export interface ModelMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Trims client-supplied history to the most recent turns, drops anything
 * blank, makes sure the conversation starts with a user turn (the Messages
 * API requires it), and appends the new question as the final user turn.
 */
export function buildModelMessages(history: AssistantRequestBody["history"], message: string): ModelMessage[] {
  const recent = history
    .map((turn) => ({ role: turn.role, content: turn.content.trim() }))
    .filter((turn) => turn.content.length > 0)
    .slice(-ASSISTANT_MAX_HISTORY_MESSAGES);

  while (recent.length > 0 && recent[0].role !== "user") recent.shift();

  return [...recent, { role: "user", content: message }];
}
