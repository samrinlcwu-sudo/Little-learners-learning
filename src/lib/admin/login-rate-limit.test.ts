import { beforeEach, describe, expect, it } from "vitest";
import {
  _resetForTests,
  getLockoutRemainingMinutes,
  isLoginLocked,
  recordFailedLoginAttempt,
  recordSuccessfulLogin,
} from "./login-rate-limit";

describe("admin login rate limiting", () => {
  beforeEach(() => {
    _resetForTests();
  });

  it("is not locked with no failed attempts", () => {
    expect(isLoginLocked()).toBe(false);
  });

  it("stays unlocked under the attempt threshold", () => {
    recordFailedLoginAttempt();
    recordFailedLoginAttempt();
    recordFailedLoginAttempt();
    recordFailedLoginAttempt();
    expect(isLoginLocked()).toBe(false);
  });

  it("locks out after the 5th consecutive failed attempt", () => {
    for (let i = 0; i < 5; i++) recordFailedLoginAttempt();
    expect(isLoginLocked()).toBe(true);
    expect(getLockoutRemainingMinutes()).toBeGreaterThan(0);
  });

  it("a successful login clears the lockout and the failure count", () => {
    for (let i = 0; i < 5; i++) recordFailedLoginAttempt();
    expect(isLoginLocked()).toBe(true);
    recordSuccessfulLogin();
    expect(isLoginLocked()).toBe(false);
  });
});
