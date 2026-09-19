import { afterEach, describe, expect, it } from "vitest";
import { isAnalyticsConfigured } from "./is-configured";

const ORIGINAL_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;

afterEach(() => {
  process.env.NEXT_PUBLIC_ANALYTICS_ID = ORIGINAL_ID;
});

describe("isAnalyticsConfigured", () => {
  it("is false when unset — the real state of this codebase today", () => {
    delete process.env.NEXT_PUBLIC_ANALYTICS_ID;
    expect(isAnalyticsConfigured()).toBe(false);
  });

  it("is false when set to an empty string", () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ID = "";
    expect(isAnalyticsConfigured()).toBe(false);
  });

  it("is true once a real id is set", () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ID = "test-id";
    expect(isAnalyticsConfigured()).toBe(true);
  });
});
