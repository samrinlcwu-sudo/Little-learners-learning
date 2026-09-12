import { describe, expect, it } from "vitest";
import { canViewTeacherProfile, canListTeacherInDirectory } from "./teacher-visibility";
import type { TeacherProfile } from "./types";

function makeTeacher(overrides: Partial<TeacherProfile> = {}): TeacherProfile {
  return {
    id: "t1",
    accountId: "local-browser-only-teacher",
    name: "Test Teacher",
    email: "test@example.com",
    countryRegion: "Canada",
    slug: "test-teacher-abc12",
    ageGroupsTaught: [],
    subjects: [],
    languages: [],
    teachingInterests: [],
    expertise: [],
    visibility: "private",
    moderationStatus: "pending",
    verified: false,
    accountStatus: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("canViewTeacherProfile", () => {
  it("is false when the teacher keeps their profile private, regardless of moderation status", () => {
    expect(canViewTeacherProfile(makeTeacher({ visibility: "private", moderationStatus: "approved" }))).toBe(false);
  });

  it("is true for a public, pending profile — unreviewed is still viewable via direct link", () => {
    expect(canViewTeacherProfile(makeTeacher({ visibility: "public", moderationStatus: "pending" }))).toBe(true);
  });

  it("is true for a public, approved profile", () => {
    expect(canViewTeacherProfile(makeTeacher({ visibility: "public", moderationStatus: "approved" }))).toBe(true);
  });

  it("is false for a public but rejected profile", () => {
    expect(canViewTeacherProfile(makeTeacher({ visibility: "public", moderationStatus: "rejected" }))).toBe(false);
  });

  it("is false for a public but hidden profile", () => {
    expect(canViewTeacherProfile(makeTeacher({ visibility: "public", moderationStatus: "hidden" }))).toBe(false);
  });

  it("is false for a deactivated account, even public and approved", () => {
    expect(
      canViewTeacherProfile(
        makeTeacher({ visibility: "public", moderationStatus: "approved", accountStatus: "deactivated" }),
      ),
    ).toBe(false);
  });
});

describe("canListTeacherInDirectory", () => {
  it("is false for a public, pending profile — viewable directly but not yet discoverable", () => {
    expect(canListTeacherInDirectory(makeTeacher({ visibility: "public", moderationStatus: "pending" }))).toBe(false);
  });

  it("is true only for a public, approved profile", () => {
    expect(canListTeacherInDirectory(makeTeacher({ visibility: "public", moderationStatus: "approved" }))).toBe(true);
  });

  it("is false for a private profile even if somehow approved", () => {
    expect(canListTeacherInDirectory(makeTeacher({ visibility: "private", moderationStatus: "approved" }))).toBe(false);
  });
});
