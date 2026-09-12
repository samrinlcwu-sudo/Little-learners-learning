import { describe, expect, it } from "vitest";
import { filterAdminTeachers } from "./admin-teacher-filters";
import type { TeacherProfile } from "./types";

function makeTeacher(overrides: Partial<TeacherProfile> = {}): TeacherProfile {
  return {
    id: "t1",
    accountId: "local-browser-only-teacher",
    name: "Amina Yusuf",
    email: "amina@example.com",
    countryRegion: "United Kingdom",
    slug: "amina-yusuf-abc12",
    ageGroupsTaught: ["preschool"],
    subjects: ["mathematics"],
    languages: ["english"],
    teachingInterests: [],
    expertise: ["Special needs support"],
    visibility: "private",
    moderationStatus: "pending",
    verified: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("filterAdminTeachers", () => {
  it("returns everything when no filters are set", () => {
    const entries = [makeTeacher(), makeTeacher({ id: "t2", name: "Second Teacher" })];
    expect(filterAdminTeachers(entries, {})).toHaveLength(2);
  });

  it("filters by subject, age group, and language", () => {
    const entries = [
      makeTeacher({ subjects: ["mathematics"], ageGroupsTaught: ["preschool"], languages: ["english"] }),
      makeTeacher({ id: "t2", subjects: ["creativity"], ageGroupsTaught: ["primary"], languages: ["arabic"] }),
    ];
    expect(filterAdminTeachers(entries, { subject: "creativity" })).toHaveLength(1);
    expect(filterAdminTeachers(entries, { ageGroup: "primary" })).toHaveLength(1);
    expect(filterAdminTeachers(entries, { language: "arabic" })).toHaveLength(1);
  });

  it("filters by moderation status — the field the public directory filter never exposes", () => {
    const entries = [
      makeTeacher({ id: "t1", moderationStatus: "pending" }),
      makeTeacher({ id: "t2", moderationStatus: "approved" }),
    ];
    const result = filterAdminTeachers(entries, { moderationStatus: "approved" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("t2");
  });

  it("matches expertise as a case-insensitive substring", () => {
    const entries = [
      makeTeacher({ expertise: ["Special needs support"] }),
      makeTeacher({ id: "t2", expertise: ["Bilingual education"] }),
    ];
    const result = filterAdminTeachers(entries, { expertise: "special" });
    expect(result).toHaveLength(1);
  });

  it("matches the free-text query against name, email, headline, bio, and region", () => {
    const entries = [
      makeTeacher({ name: "Amina Yusuf", email: "amina@example.com", countryRegion: "United Kingdom" }),
      makeTeacher({ id: "t2", name: "Second Teacher", email: "second@example.com", countryRegion: "Canada" }),
    ];
    expect(filterAdminTeachers(entries, { query: "canada" })).toHaveLength(1);
    expect(filterAdminTeachers(entries, { query: "second@example.com" })).toHaveLength(1);
  });

  it("combines multiple filters with AND semantics", () => {
    const entries = [
      makeTeacher({ subjects: ["mathematics"], moderationStatus: "pending" }),
      makeTeacher({ id: "t2", subjects: ["mathematics"], moderationStatus: "approved" }),
    ];
    const result = filterAdminTeachers(entries, { subject: "mathematics", moderationStatus: "approved" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("t2");
  });
});
