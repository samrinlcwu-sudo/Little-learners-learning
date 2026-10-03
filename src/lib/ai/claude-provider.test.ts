import { afterEach, describe, expect, it, vi } from "vitest";
import { claudeProvider } from "./claude-provider";

function mockFetch(impl: () => Promise<Response>) {
  const fn = vi.fn(impl);
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("claudeProvider", () => {
  it("identifies as a real (non-placeholder) provider", () => {
    expect(claudeProvider.isDevelopmentPlaceholder).toBe(false);
  });

  it("returns the server's reply as an assistant message", async () => {
    mockFetch(async () => Response.json({ reply: "Try /learn/mathematics." }));
    const reply = await claudeProvider.respond({ audience: "public", message: "maths?", history: [] });
    expect(reply.role).toBe("assistant");
    expect(reply.content).toBe("Try /learn/mathematics.");
  });

  it("sends only role and text of earlier turns — no ids or timestamps", async () => {
    const fetchFn = mockFetch(async () => Response.json({ reply: "ok" }));
    await claudeProvider.respond({
      audience: "parent",
      message: "next",
      history: [{ id: "abc", role: "user", content: "earlier", createdAt: "2026-01-01" }],
    });
    const body = JSON.parse((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body).toEqual({ audience: "parent", message: "next", history: [{ role: "user", content: "earlier" }] });
  });

  it("turns a 429 into a friendly wait message", async () => {
    mockFetch(async () => Response.json({ error: "rate_limited" }, { status: 429 }));
    const reply = await claudeProvider.respond({ audience: "public", message: "hi", history: [] });
    expect(reply.content).toContain("wait a moment");
  });

  it("turns a server error into a plain fallback without any upstream detail", async () => {
    mockFetch(async () => Response.json({ error: "upstream" }, { status: 503 }));
    const reply = await claudeProvider.respond({ audience: "public", message: "hi", history: [] });
    expect(reply.content).toContain("couldn't answer");
    expect(reply.content).not.toContain("upstream");
  });

  it("never throws on a network failure", async () => {
    mockFetch(async () => {
      throw new TypeError("network down");
    });
    const reply = await claudeProvider.respond({ audience: "public", message: "hi", history: [] });
    expect(reply.content).toContain("couldn't answer");
  });

  it("treats a malformed success body as a failure", async () => {
    mockFetch(async () => Response.json({ nope: true }));
    const reply = await claudeProvider.respond({ audience: "public", message: "hi", history: [] });
    expect(reply.content).toContain("couldn't answer");
  });
});
