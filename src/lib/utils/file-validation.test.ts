import { describe, expect, it } from "vitest";
import { validateUploadedFile } from "./file-validation";

const imageRule = { acceptedTypePrefixes: ["image/"], maxBytes: 2 * 1024 * 1024, typeDescription: "an image" };

function fakeFile(type: string, sizeBytes: number): File {
  return { type, size: sizeBytes } as File;
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
});
