import { afterEach, describe, expect, it, vi } from "vitest";
import { getAiAssistantProvider } from "./get-provider";

afterEach(() => vi.unstubAllEnvs());

describe("getAiAssistantProvider", () => {
  it("is the honest placeholder unless explicitly enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_AI_ASSISTANT_ENABLED", "");
    expect(getAiAssistantProvider().isDevelopmentPlaceholder).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_AI_ASSISTANT_ENABLED", "yes");
    expect(getAiAssistantProvider().isDevelopmentPlaceholder).toBe(true);
  });

  it("is the real provider when enabled with exactly 'true'", () => {
    vi.stubEnv("NEXT_PUBLIC_AI_ASSISTANT_ENABLED", "true");
    const provider = getAiAssistantProvider();
    expect(provider.id).toBe("claude");
    expect(provider.isDevelopmentPlaceholder).toBe(false);
  });
});
