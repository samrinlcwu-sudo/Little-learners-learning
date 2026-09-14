import { describe, expect, it } from "vitest";
import { buildAuthorSchema, buildTeacherPersonSchema } from "./author-schema";

describe("buildAuthorSchema", () => {
  it("uses Organization for a platform author", () => {
    expect(buildAuthorSchema({ name: "Little Learners Learning", role: "platform" })).toEqual({
      "@type": "Organization",
      name: "Little Learners Learning",
    });
  });

  it("uses Person for a teacher author, with no fabricated url", () => {
    const schema = buildAuthorSchema({ name: "Amina Yusuf", role: "teacher", teacherId: "t1" });
    expect(schema).toEqual({ "@type": "Person", name: "Amina Yusuf" });
    expect(schema).not.toHaveProperty("url");
  });
});

describe("buildTeacherPersonSchema", () => {
  it("includes only real, provided fields", () => {
    const schema = buildTeacherPersonSchema({
      name: "Amina Yusuf",
      url: "https://example.com/teachers/p/amina-yusuf-abc12",
      headline: "Kindergarten teacher",
      knowsAbout: ["Mathematics", "Bilingual education"],
    });
    expect(schema).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Amina Yusuf",
      url: "https://example.com/teachers/p/amina-yusuf-abc12",
      description: "Kindergarten teacher",
      knowsAbout: ["Mathematics", "Bilingual education"],
    });
  });

  it("prefers headline over bio for description", () => {
    const schema = buildTeacherPersonSchema({
      name: "Amina Yusuf",
      url: "https://example.com/teachers/p/amina-yusuf-abc12",
      headline: "Kindergarten teacher",
      bio: "A longer bio.",
    });
    expect(schema.description).toBe("Kindergarten teacher");
  });

  it("omits description and knowsAbout entirely when nothing real exists", () => {
    const schema = buildTeacherPersonSchema({ name: "Amina Yusuf", url: "https://example.com/teachers/p/amina-yusuf-abc12" });
    expect(schema).not.toHaveProperty("description");
    expect(schema).not.toHaveProperty("knowsAbout");
    expect(schema).not.toHaveProperty("image");
  });
});
