import { describe, expect, it } from "vitest";
import { filterTeacherDirectory, paginateTeacherDirectory } from "./teacher-directory-filters";
import type { PublicTeacherProfile } from "./teacher-public-profile";

function makeEntry(overrides: Partial<PublicTeacherProfile> = {}): PublicTeacherProfile {
  return {
    name: "Amina Yusuf",
    slug: "amina-yusuf-abc12",
    countryRegion: "United Kingdom",
    ageGroupsTaught: ["preschool"],
    subjects: ["mathematics"],
    languages: ["english"],
    expertise: ["Special needs support"],
    teachingInterests: ["hands-on-learning"],
    verified: false,
    ...overrides,
  };
}

describe("filterTeacherDirectory", () => {
  it("returns everything when no filters are set", () => {
    const entries = [makeEntry(), makeEntry({ name: "Second Teacher", slug: "second" })];
    expect(filterTeacherDirectory(entries, {})).toHaveLength(2);
  });

  it("filters by subject", () => {
    const entries = [makeEntry({ subjects: ["mathematics"] }), makeEntry({ subjects: ["creativity"] })];
    const result = filterTeacherDirectory(entries, { subject: "creativity" });
    expect(result).toHaveLength(1);
    expect(result[0].subjects).toContain("creativity");
  });

  it("filters by age group", () => {
    const entries = [makeEntry({ ageGroupsTaught: ["preschool"] }), makeEntry({ ageGroupsTaught: ["primary"] })];
    const result = filterTeacherDirectory(entries, { ageGroup: "primary" });
    expect(result).toHaveLength(1);
  });

  it("filters by language", () => {
    const entries = [makeEntry({ languages: ["english"] }), makeEntry({ languages: ["arabic"] })];
    const result = filterTeacherDirectory(entries, { language: "arabic" });
    expect(result).toHaveLength(1);
  });

  it("matches expertise as a case-insensitive substring", () => {
    const entries = [makeEntry({ expertise: ["Special needs support"] }), makeEntry({ expertise: ["Bilingual education"] })];
    const result = filterTeacherDirectory(entries, { expertise: "special" });
    expect(result).toHaveLength(1);
    expect(result[0].expertise[0]).toBe("Special needs support");
  });

  it("filters by teaching interest", () => {
    const entries = [
      makeEntry({ teachingInterests: ["montessori-inspired"] }),
      makeEntry({ teachingInterests: ["play-based-learning"] }),
    ];
    const result = filterTeacherDirectory(entries, { teachingInterest: "montessori-inspired" });
    expect(result).toHaveLength(1);
    expect(result[0].teachingInterests).toContain("montessori-inspired");
  });

  it("matches the free-text query against name, headline, bio, and region", () => {
    const entries = [
      makeEntry({ name: "Amina Yusuf", countryRegion: "United Kingdom" }),
      makeEntry({ name: "Second Teacher", countryRegion: "Canada" }),
    ];
    expect(filterTeacherDirectory(entries, { query: "canada" })).toHaveLength(1);
    expect(filterTeacherDirectory(entries, { query: "amina" })).toHaveLength(1);
  });

  it("combines multiple filters with AND semantics", () => {
    const entries = [
      makeEntry({ subjects: ["mathematics"], languages: ["arabic"] }),
      makeEntry({ subjects: ["mathematics"], languages: ["english"] }),
    ];
    const result = filterTeacherDirectory(entries, { subject: "mathematics", language: "arabic" });
    expect(result).toHaveLength(1);
  });
});

describe("paginateTeacherDirectory", () => {
  it("slices to the requested page size", () => {
    const entries = Array.from({ length: 25 }, (_, i) => makeEntry({ slug: `teacher-${i}` }));
    const result = paginateTeacherDirectory(entries, 1, 12);
    expect(result.items).toHaveLength(12);
    expect(result.pageCount).toBe(3);
    expect(result.totalCount).toBe(25);
  });

  it("clamps an out-of-range page to the last valid page", () => {
    const entries = Array.from({ length: 5 }, (_, i) => makeEntry({ slug: `teacher-${i}` }));
    const result = paginateTeacherDirectory(entries, 99, 12);
    expect(result.page).toBe(1);
    expect(result.items).toHaveLength(5);
  });

  it("returns an empty page (never an error) for an empty directory", () => {
    const result = paginateTeacherDirectory([], 1, 12);
    expect(result.items).toEqual([]);
    expect(result.pageCount).toBe(1);
    expect(result.totalCount).toBe(0);
  });
});
