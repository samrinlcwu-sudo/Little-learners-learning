import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ASSISTANT_MAX_REQUEST_BYTES, ASSISTANT_MODEL, ASSISTANT_RATE_LIMIT } from "@/lib/ai/assistant-config";

const { create, MockAPIError } = vi.hoisted(() => {
  class MockAPIError extends Error {
    status?: number;
    constructor(status?: number, message = "upstream detail that must never leak") {
      super(message);
      this.status = status;
    }
  }
  return { create: vi.fn(), MockAPIError };
});

vi.mock("@anthropic-ai/sdk", () => {
  class Anthropic {
    static APIError = MockAPIError;
    messages = { create };
    constructor(public options: unknown) {}
  }
  return { default: Anthropic };
});

import { POST } from "./route";

let ipCounter = 0;
function post(body: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1;
  return POST(
    new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "x-real-ip": `10.0.0.${ipCounter}`, ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const valid = { audience: "public", message: "What subjects do you cover?", history: [] };

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  vi.stubEnv("NEXT_PUBLIC_AI_ASSISTANT_ENABLED", "true");
  create.mockReset();
  create.mockResolvedValue({ content: [{ type: "text", text: "We cover 16 subjects — see /learn." }] });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/assistant", () => {
  it("is unavailable without an API key, and never calls the model", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const res = await post(valid);
    expect(res.status).toBe(503);
    expect(create).not.toHaveBeenCalled();
  });

  it("is unavailable when the public switch is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_AI_ASSISTANT_ENABLED", "");
    const res = await post(valid);
    expect(res.status).toBe(503);
    expect(create).not.toHaveBeenCalled();
  });

  it("answers a valid question using the configured model and a bounded request", async () => {
    const res = await post({ ...valid, history: [{ role: "user", content: "hi" }, { role: "assistant", content: "hello" }] });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ reply: "We cover 16 subjects — see /learn." });

    const args = create.mock.calls[0][0];
    expect(args.model).toBe(ASSISTANT_MODEL);
    expect(args.max_tokens).toBeLessThanOrEqual(1000);
    expect(args.messages.at(-1)).toEqual({ role: "user", content: valid.message });
    expect(args.system[0].text).toContain("Little Learners Assistant");
  });

  it("rejects malformed and invalid bodies without calling the model", async () => {
    expect((await post("{not json")).status).toBe(400);
    expect((await post({ audience: "public", message: "" })).status).toBe(400);
    expect((await post({ audience: "nobody", message: "hi" })).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects oversized bodies", async () => {
    const res = await post(JSON.stringify({ ...valid, message: "x".repeat(ASSISTANT_MAX_REQUEST_BYTES + 1) }));
    expect(res.status).toBe(413);
    expect(create).not.toHaveBeenCalled();
  });

  it("refuses the child and admin audiences", async () => {
    expect((await post({ ...valid, audience: "child" })).status).toBe(403);
    expect((await post({ ...valid, audience: "admin" })).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("refuses cross-site requests but allows same-origin and header-less ones", async () => {
    expect((await post(valid, { origin: "https://evil.example", host: "localhost" })).status).toBe(403);
    expect((await post(valid, { origin: "http://localhost", host: "localhost" })).status).toBe(200);
    expect((await post(valid)).status).toBe(200);
  });

  it("rate-limits a single client address", async () => {
    const headers = { "x-real-ip": "203.0.113.9" };
    for (let i = 0; i < ASSISTANT_RATE_LIMIT.maxRequests; i++) {
      expect((await post(valid, headers)).status).toBe(200);
    }
    const blocked = await post(valid, headers);
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThanOrEqual(1);
  });

  it("returns a fixed error code on upstream failure — never upstream text or the user's message", async () => {
    create.mockRejectedValue(new MockAPIError(500));
    const res = await post({ ...valid, message: "my secret question" });
    expect(res.status).toBe(503);
    const text = await res.text();
    expect(text).not.toContain("upstream detail");
    expect(text).not.toContain("my secret question");
    expect(JSON.stringify((console.error as ReturnType<typeof vi.fn>).mock.calls)).not.toContain("my secret question");
  });

  it("distinguishes an upstream rate limit as busy", async () => {
    create.mockRejectedValue(new MockAPIError(429));
    const res = await post(valid);
    expect(await res.json()).toEqual({ error: "busy" });
  });

  it("falls back to a fixed message if the model returns no text", async () => {
    create.mockResolvedValue({ content: [] });
    const res = await post(valid);
    expect((await res.json()).reply).toContain("not able to help");
  });
});
