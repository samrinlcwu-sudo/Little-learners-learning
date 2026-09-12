import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createAdminSessionToken, verifyAdminPassphrase, verifyAdminSessionToken } from "./session";

const ORIGINAL_PASSPHRASE = process.env.ADMIN_PASSPHRASE;
const ORIGINAL_SECRET = process.env.ADMIN_SESSION_SECRET;

beforeEach(() => {
  process.env.ADMIN_PASSPHRASE = "test-passphrase-123";
  process.env.ADMIN_SESSION_SECRET = "test-session-secret-abc";
});

afterEach(() => {
  process.env.ADMIN_PASSPHRASE = ORIGINAL_PASSPHRASE;
  process.env.ADMIN_SESSION_SECRET = ORIGINAL_SECRET;
});

describe("verifyAdminPassphrase", () => {
  it("is true for the exact configured passphrase", async () => {
    expect(await verifyAdminPassphrase("test-passphrase-123")).toBe(true);
  });

  it("is false for any other value", async () => {
    expect(await verifyAdminPassphrase("wrong")).toBe(false);
    expect(await verifyAdminPassphrase("")).toBe(false);
  });

  it("is false when ADMIN_PASSPHRASE isn't configured", async () => {
    delete process.env.ADMIN_PASSPHRASE;
    expect(await verifyAdminPassphrase("test-passphrase-123")).toBe(false);
  });
});

describe("createAdminSessionToken / verifyAdminSessionToken", () => {
  it("round-trips: a freshly created token verifies as valid", async () => {
    const token = await createAdminSessionToken();
    expect(await verifyAdminSessionToken(token)).toBe(true);
  });

  it("rejects a tampered payload — the signature no longer matches", async () => {
    const token = await createAdminSessionToken();
    const [payload, signature] = token.split(".");
    const tampered = `${payload}x.${signature}`;
    expect(await verifyAdminSessionToken(tampered)).toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createAdminSessionToken();
    process.env.ADMIN_SESSION_SECRET = "a-different-secret";
    expect(await verifyAdminSessionToken(token)).toBe(false);
  });

  it("rejects missing, empty, or malformed tokens", async () => {
    expect(await verifyAdminSessionToken(undefined)).toBe(false);
    expect(await verifyAdminSessionToken(null)).toBe(false);
    expect(await verifyAdminSessionToken("")).toBe(false);
    expect(await verifyAdminSessionToken("not-a-real-token")).toBe(false);
  });

  it("fails closed when ADMIN_SESSION_SECRET isn't configured, even for an otherwise-valid-looking token", async () => {
    const token = await createAdminSessionToken();
    delete process.env.ADMIN_SESSION_SECRET;
    expect(await verifyAdminSessionToken(token)).toBe(false);
  });

  it("rejects a correctly signed but expired token", async () => {
    // Hand-built with the exact same construction createAdminSessionToken uses,
    // but with `exp` already in the past — proves expiry is actually checked,
    // not just the signature.
    function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
      const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      let binary = "";
      for (const byte of array) binary += String.fromCharCode(byte);
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    const secret = process.env.ADMIN_SESSION_SECRET!;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
      "sign",
    ]);
    const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify({ exp: Date.now() - 1000 })));
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
    const expiredToken = `${payloadB64}.${toBase64Url(signature)}`;

    expect(await verifyAdminSessionToken(expiredToken)).toBe(false);
  });
});
