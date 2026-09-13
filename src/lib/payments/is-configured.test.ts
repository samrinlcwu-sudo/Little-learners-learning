import { afterEach, describe, expect, it } from "vitest";
import { isPaymentProviderConfigured } from "./is-configured";

const ORIGINAL_ID = process.env.PAYMENT_PROVIDER_ID;
const ORIGINAL_SECRET = process.env.PAYMENT_PROVIDER_SECRET_KEY;

afterEach(() => {
  process.env.PAYMENT_PROVIDER_ID = ORIGINAL_ID;
  process.env.PAYMENT_PROVIDER_SECRET_KEY = ORIGINAL_SECRET;
});

describe("isPaymentProviderConfigured", () => {
  it("is false when neither variable is set — the real state of this codebase today", () => {
    delete process.env.PAYMENT_PROVIDER_ID;
    delete process.env.PAYMENT_PROVIDER_SECRET_KEY;
    expect(isPaymentProviderConfigured()).toBe(false);
  });

  it("is false when only one of the two variables is set", () => {
    process.env.PAYMENT_PROVIDER_ID = "test-provider";
    delete process.env.PAYMENT_PROVIDER_SECRET_KEY;
    expect(isPaymentProviderConfigured()).toBe(false);

    delete process.env.PAYMENT_PROVIDER_ID;
    process.env.PAYMENT_PROVIDER_SECRET_KEY = "test-secret";
    expect(isPaymentProviderConfigured()).toBe(false);
  });

  it("is true only once both variables are set", () => {
    process.env.PAYMENT_PROVIDER_ID = "test-provider";
    process.env.PAYMENT_PROVIDER_SECRET_KEY = "test-secret";
    expect(isPaymentProviderConfigured()).toBe(true);
  });
});
