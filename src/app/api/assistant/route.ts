import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  ASSISTANT_MAX_OUTPUT_TOKENS,
  ASSISTANT_MAX_REQUEST_BYTES,
  ASSISTANT_MODEL,
  ASSISTANT_RATE_LIMIT,
  isAssistantEnabled,
} from "@/lib/ai/assistant-config";
import { assistantRequestSchema, buildModelMessages } from "@/lib/ai/assistant-request";
import { AI_AUDIENCE_PERMISSIONS } from "@/lib/ai/permissions";
import { createRateLimiter } from "@/lib/ai/rate-limit";
import { buildAssistantSystemPrompt } from "@/lib/ai/system-prompt";

export const maxDuration = 30;

const limiter = createRateLimiter(ASSISTANT_RATE_LIMIT);

const EMPTY_REPLY_FALLBACK =
  "I'm not able to help with that one. Try asking about our subjects, resources, or games — or use the search icon at the top of the page.";

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") ?? forwarded ?? "unknown";
}

function isCrossSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.headers.get("host");
  } catch {
    return true;
  }
}

function fail(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

/**
 * The only place the Anthropic key is ever read — server-only, never
 * `NEXT_PUBLIC_`. Every failure path returns a short, fixed error code and
 * never echoes upstream error text or the user's message, and nothing about
 * a conversation is logged or stored (only an upstream status code, so a
 * misconfigured key is diagnosable without recording anyone's words).
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!isAssistantEnabled() || !apiKey) return fail("unavailable", 503);

  if (isCrossSite(request)) return fail("forbidden", 403);

  const rate = limiter.check(clientKey(request));
  if (!rate.allowed) return fail("rate_limited", 429, { "Retry-After": String(rate.retryAfterSeconds) });

  const raw = await request.text();
  if (raw.length > ASSISTANT_MAX_REQUEST_BYTES) return fail("too_large", 413);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail("invalid_request", 400);
  }

  const parsed = assistantRequestSchema.safeParse(json);
  if (!parsed.success) return fail("invalid_request", 400);

  const { audience, message, history } = parsed.data;
  if (!AI_AUDIENCE_PERMISSIONS[audience].mayAccessAssistant) return fail("forbidden", 403);

  try {
    const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 25_000 });
    const response = await client.messages.create({
      model: ASSISTANT_MODEL,
      max_tokens: ASSISTANT_MAX_OUTPUT_TOKENS,
      system: [{ type: "text", text: buildAssistantSystemPrompt(audience), cache_control: { type: "ephemeral" } }],
      messages: buildModelMessages(history, message),
    });

    const reply = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n")
      .trim()
      .slice(0, 4000);

    return NextResponse.json({ reply: reply || EMPTY_REPLY_FALLBACK });
  } catch (error) {
    const status = error instanceof Anthropic.APIError ? error.status : undefined;
    console.error("[assistant] upstream request failed", { status });
    return fail(status === 429 ? "busy" : "upstream", 503);
  }
}
