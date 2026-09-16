import { describe, expect, it } from "vitest";
import { toJsonLdHtml } from "./json-ld";

describe("toJsonLdHtml", () => {
  it("produces valid JSON for ordinary data", () => {
    const html = toJsonLdHtml({ name: "Mathematics", age: 5 });
    expect(JSON.parse(html)).toEqual({ name: "Mathematics", age: 5 });
  });

  it("escapes a literal </script> so it can't close the surrounding script tag", () => {
    const malicious = "</script><script>alert(document.cookie)</script>";
    const html = toJsonLdHtml({ headline: malicious });
    expect(html).not.toContain("</script>");
    // still round-trips to the original, unescaped string once parsed as JSON
    expect(JSON.parse(html)).toEqual({ headline: malicious });
  });

  it("escapes every '<' so no HTML tag can open from within the payload", () => {
    const html = toJsonLdHtml({ bio: "<img src=x onerror=alert(1)>" });
    expect(html).not.toContain("<img");
  });
});
