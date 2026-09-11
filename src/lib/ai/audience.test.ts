import { describe, expect, it } from "vitest";
import { getAiAudience } from "./audience";

describe("getAiAudience", () => {
  it("is public on the homepage and other marketing pages", () => {
    expect(getAiAudience("/")).toBe("public");
    expect(getAiAudience("/resources")).toBe("public");
    expect(getAiAudience("/learn/mathematics")).toBe("public");
  });

  it("is public on the teacher directory and a public teacher profile", () => {
    expect(getAiAudience("/teachers")).toBe("public");
    expect(getAiAudience("/teachers/p/amina-hussain-ab12")).toBe("public");
  });

  it("is parent on the parent dashboard and account pages", () => {
    expect(getAiAudience("/dashboard")).toBe("parent");
    expect(getAiAudience("/account")).toBe("parent");
  });

  it("is child on a child's own learning page, even though it sits under /dashboard", () => {
    expect(getAiAudience("/dashboard/children/child-1")).toBe("child");
  });

  it("is teacher on the teacher dashboard and registration flow", () => {
    expect(getAiAudience("/teachers/dashboard")).toBe("teacher");
    expect(getAiAudience("/teachers/register")).toBe("teacher");
    expect(getAiAudience("/teachers/register/profile")).toBe("teacher");
  });
});
