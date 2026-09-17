import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { _resetForTests } from "./login-rate-limit";

const ORIGINAL_PASSPHRASE = process.env.ADMIN_PASSPHRASE;
const ORIGINAL_SECRET = process.env.ADMIN_SESSION_SECRET;

type CookieRecord = { name: string; value: string; options?: Record<string, unknown> };

let setCookies: CookieRecord[] = [];
let deletedCookies: string[] = [];

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      setCookies.push({ name, value, options });
    },
    delete: (name: string) => {
      deletedCookies.push(name);
    },
  }),
}));

function makeFormData(passphrase: string): FormData {
  const formData = new FormData();
  formData.set("passphrase", passphrase);
  return formData;
}

beforeEach(() => {
  process.env.ADMIN_PASSPHRASE = "test-passphrase-123";
  process.env.ADMIN_SESSION_SECRET = "test-session-secret-abc";
  setCookies = [];
  deletedCookies = [];
  _resetForTests();
});

afterEach(() => {
  process.env.ADMIN_PASSPHRASE = ORIGINAL_PASSPHRASE;
  process.env.ADMIN_SESSION_SECRET = ORIGINAL_SECRET;
  _resetForTests();
});

describe("adminLoginAction", () => {
  it("fails closed with a config error when admin auth isn't configured — never falls through to a check that could pass", async () => {
    delete process.env.ADMIN_PASSPHRASE;
    const { adminLoginAction } = await import("./actions");
    const result = await adminLoginAction({}, makeFormData("test-passphrase-123"));
    expect(result.success).toBeUndefined();
    expect(result.error).toMatch(/isn't configured/i);
    expect(setCookies).toHaveLength(0);
  });

  it("rejects an incorrect passphrase and sets no cookie — the unauthorized-request case", async () => {
    const { adminLoginAction } = await import("./actions");
    const result = await adminLoginAction({}, makeFormData("wrong-passphrase"));
    expect(result.error).toBe("Incorrect passphrase.");
    expect(result.success).toBeUndefined();
    expect(setCookies).toHaveLength(0);
  });

  it("accepts the correct passphrase and sets a real, httpOnly session cookie — the authorized-request case", async () => {
    const { adminLoginAction } = await import("./actions");
    const result = await adminLoginAction({}, makeFormData("test-passphrase-123"));
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0].name).toBe("llad_session");
    expect(setCookies[0].value).toMatch(/^[\w-]+\.[\w-]+$/);
    expect(setCookies[0].options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
  });

  it("treats a missing passphrase field as an incorrect attempt rather than throwing", async () => {
    const { adminLoginAction } = await import("./actions");
    const result = await adminLoginAction({}, new FormData());
    expect(result.error).toBe("Incorrect passphrase.");
    expect(setCookies).toHaveLength(0);
  });

  it("locks out after repeated failed attempts and stops evaluating the passphrase at all — even a correct one is refused mid-lockout", async () => {
    const { adminLoginAction } = await import("./actions");
    for (let i = 0; i < 5; i++) {
      await adminLoginAction({}, makeFormData("wrong-passphrase"));
    }
    const result = await adminLoginAction({}, makeFormData("test-passphrase-123"));
    expect(result.error).toMatch(/too many incorrect attempts/i);
    expect(result.success).toBeUndefined();
    expect(setCookies).toHaveLength(0);
  });

  it("a successful login clears any prior failed-attempt count", async () => {
    const { adminLoginAction } = await import("./actions");
    await adminLoginAction({}, makeFormData("wrong-passphrase"));
    await adminLoginAction({}, makeFormData("wrong-passphrase"));
    const success = await adminLoginAction({}, makeFormData("test-passphrase-123"));
    expect(success.success).toBe(true);

    for (let i = 0; i < 4; i++) {
      await adminLoginAction({}, makeFormData("wrong-passphrase"));
    }
    const stillEvaluating = await adminLoginAction({}, makeFormData("wrong-passphrase"));
    expect(stillEvaluating.error).toBe("Incorrect passphrase.");
  });
});

describe("adminLogoutAction", () => {
  it("deletes the session cookie", async () => {
    const { adminLogoutAction } = await import("./actions");
    await adminLogoutAction();
    expect(deletedCookies).toEqual(["llad_session"]);
  });
});
