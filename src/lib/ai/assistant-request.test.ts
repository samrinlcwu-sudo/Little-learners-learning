import { describe, expect, it } from "vitest";
import { ASSISTANT_MAX_HISTORY_MESSAGES, ASSISTANT_MAX_MESSAGE_CHARS } from "./assistant-config";
import { assistantRequestSchema, buildModelMessages } from "./assistant-request";

describe("assistantRequestSchema", () => {
  it("accepts a minimal valid request and defaults history to empty", () => {
    const parsed = assistantRequestSchema.safeParse({ audience: "public", message: "  What subjects do you cover?  " });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.message).toBe("What subjects do you cover?");
      expect(parsed.data.history).toEqual([]);
    }
  });

  it("rejects an empty or whitespace-only message", () => {
    expect(assistantRequestSchema.safeParse({ audience: "public", message: "   " }).success).toBe(false);
  });

  it("rejects an over-long message", () => {
    const message = "a".repeat(ASSISTANT_MAX_MESSAGE_CHARS + 1);
    expect(assistantRequestSchema.safeParse({ audience: "public", message }).success).toBe(false);
  });

  it("rejects an unknown audience", () => {
    expect(assistantRequestSchema.safeParse({ audience: "superuser", message: "hi" }).success).toBe(false);
  });

  it("drops unexpected fields from history turns (no ids, no timestamps travel onward)", () => {
    const parsed = assistantRequestSchema.parse({
      audience: "parent",
      message: "hi",
      history: [{ role: "user", content: "earlier", id: "x", createdAt: "now", childId: "secret" }],
    });
    expect(parsed.history[0]).toEqual({ role: "user", content: "earlier" });
  });
});

describe("buildModelMessages", () => {
  it("appends the new question as the final user turn", () => {
    const messages = buildModelMessages([{ role: "user", content: "a" }, { role: "assistant", content: "b" }], "c");
    expect(messages.at(-1)).toEqual({ role: "user", content: "c" });
    expect(messages).toHaveLength(3);
  });

  it("keeps only the most recent turns", () => {
    const history = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `turn ${i}`,
    }));
    const messages = buildModelMessages(history, "now");
    expect(messages.length).toBeLessThanOrEqual(ASSISTANT_MAX_HISTORY_MESSAGES + 1);
    expect(messages.at(-2)?.content).toBe("turn 19");
  });

  it("never starts the conversation with an assistant turn", () => {
    const messages = buildModelMessages([{ role: "assistant", content: "welcome" }, { role: "user", content: "q" }], "next");
    expect(messages[0].role).toBe("user");
  });

  it("drops blank turns", () => {
    const messages = buildModelMessages([{ role: "user", content: "   " }], "hello");
    expect(messages).toEqual([{ role: "user", content: "hello" }]);
  });
});
