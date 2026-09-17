import { describe, expect, it } from "vitest";
import { validateUploadedFile } from "./file-validation";

const imageRule = { acceptedTypePrefixes: ["image/"], maxBytes: 2 * 1024 * 1024, typeDescription: "an image" };

function fakeFile(type: string, sizeBytes: number, name = "upload"): File {
  return { type, size: sizeBytes, name } as File;
}

describe("validateUploadedFile", () => {
  it("accepts a real raster image under the size cap", () => {
    expect(validateUploadedFile(fakeFile("image/png", 1024), imageRule)).toBeNull();
  });

  it("rejects a non-matching type", () => {
    expect(validateUploadedFile(fakeFile("application/pdf", 1024), imageRule)).toContain("an image");
  });

  it("rejects an oversized file", () => {
    expect(validateUploadedFile(fakeFile("image/png", 3 * 1024 * 1024), imageRule)).toContain("2MB");
  });

  it("rejects SVG even though it matches the image/ prefix — it can carry a <script>", () => {
    expect(validateUploadedFile(fakeFile("image/svg+xml", 1024), imageRule)).toContain("an image");
  });

  it("decides purely on type and size — a malicious or path-traversal-style filename neither bypasses nor triggers extra rejection, because the filename is never inspected at all", () => {
    const traversalName = "../../../../etc/passwd.png";
    const scriptName = "<script>alert(1)</script>.png";
    expect(validateUploadedFile(fakeFile("image/png", 1024, traversalName), imageRule)).toBeNull();
    expect(validateUploadedFile(fakeFile("image/png", 1024, scriptName), imageRule)).toBeNull();
    expect(validateUploadedFile(fakeFile("application/x-msdownload", 1024, "totally-a-photo.png"), imageRule)).toContain(
      "an image",
    );
  });
});
