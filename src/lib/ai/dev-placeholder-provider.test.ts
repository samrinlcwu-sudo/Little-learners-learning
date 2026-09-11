import { describe, expect, it } from "vitest";
import { devPlaceholderProvider } from "./dev-placeholder-provider";

describe("devPlaceholderProvider", () => {
  it("identifies itself as a development placeholder", () => {
    expect(devPlaceholderProvider.isDevelopmentPlaceholder).toBe(true);
  });

  it("returns the same reply regardless of what was asked", async () => {
    const first = await devPlaceholderProvider.respond({ audience: "parent", message: "Is my child on track?", history: [] });
    const second = await devPlaceholderProvider.respond({ audience: "parent", message: "asdkfjhaslkdjfh", history: [] });
    expect(first.content).toBe(second.content);
    expect(first.content).toContain("development placeholder");
  });

  it("gives a distinct, unavailable reply for audiences without assistant access", async () => {
    const reply = await devPlaceholderProvider.respond({ audience: "child", message: "hi", history: [] });
    expect(reply.content).not.toContain("development placeholder");
  });

  it("always replies as the assistant, with a fresh id each time", async () => {
    const first = await devPlaceholderProvider.respond({ audience: "teacher", message: "hi", history: [] });
    const second = await devPlaceholderProvider.respond({ audience: "teacher", message: "hi", history: [] });
    expect(first.role).toBe("assistant");
    expect(first.id).not.toBe(second.id);
  });
});
