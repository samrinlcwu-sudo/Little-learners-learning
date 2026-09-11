/**
 * Safety rules a real provider integration must be built around later —
 * not enforced by code today (there's no real provider to constrain yet),
 * but written down now so they're a requirement from day one rather than a
 * retrofit. See docs/AI_ASSISTANT_ARCHITECTURE.md, "Safety."
 */
export const AI_SAFETY_GUIDELINES: readonly string[] = [
  "Never ask a child for their real name, school, address, photo, or any other identifying detail.",
  "Never reveal one family's or one teacher's private data to a different user.",
  "Never claim to be a human teacher, or otherwise imply the reply came from a person.",
  "Never give unsafe, medical, legal, or crisis-response instructions — point to a trusted adult or professional instead.",
  "Never invent Qur'an or Nazra content — only reference human-verified source material, and say plainly when none is connected yet.",
  "Never request or store a password, payment detail, or other credential.",
];

/**
 * Shown in the assistant UI itself (src/components/patterns/ai-assistant.tsx),
 * not just documented — a real disclosure, not fine print.
 */
export const AI_DISCLOSURE_TEXT =
  "This assistant is an AI feature still in development. It doesn't save your conversation, isn't a substitute for a teacher or other professional, and will never ask for personal information.";
