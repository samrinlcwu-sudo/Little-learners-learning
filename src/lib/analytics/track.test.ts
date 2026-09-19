import { afterEach, describe, expect, it } from "vitest";
import { trackEvent } from "./track";

const ORIGINAL_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;

afterEach(() => {
  process.env.NEXT_PUBLIC_ANALYTICS_ID = ORIGINAL_ID;
});

describe("trackEvent", () => {
  it("never throws when analytics isn't configured — the real state of this codebase today", () => {
    delete process.env.NEXT_PUBLIC_ANALYTICS_ID;
    expect(() => trackEvent("resource_viewed", { slug: "counting-animals-worksheet" })).not.toThrow();
  });

  it("never throws once analytics is configured either, since no provider call is wired up yet", () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ID = "test-id";
    expect(() => trackEvent("application_completed")).not.toThrow();
  });

  it("accepts every event name this platform measures without a type error", () => {
    delete process.env.NEXT_PUBLIC_ANALYTICS_ID;
    expect(() => {
      trackEvent("learning_category_viewed", { category: "mathematics" });
      trackEvent("resource_viewed", { slug: "first-shapes-ebook" });
      trackEvent("game_opened", { slug: "letter-match" });
      trackEvent("contact_initiated");
      trackEvent("teacher_registration_started");
      trackEvent("teacher_registration_completed");
      trackEvent("application_started");
      trackEvent("application_completed");
    }).not.toThrow();
  });
});
