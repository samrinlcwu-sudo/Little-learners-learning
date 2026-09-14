import { describe, expect, it } from "vitest";
import { resolveAuthorProfileHref } from "./author-profile-link";
import type { TeacherProfile } from "./types";

function makeTeacher(overrides: Partial<TeacherProfile> = {}): TeacherProfile {
  return {
    id: "t1",
    accountId: "local-browser-only-teacher",
    name: "Amina Yusuf",
    email: "amina@example.com",
    countryRegion: "United Kingdom",
    slug: "amina-yusuf-abc12",
    ageGroupsTaught: [],
    subjects: [],
    languages: [],
    teachingInterests: [],
    expertise: [],
    visibility: "public",
    moderationStatus: "approved",
    verified: false,
    accountStatus: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("resolveAuthorProfileHref", () => {
  it("links a platform author to /about", () => {
    expect(resolveAuthorProfileHref({ name: "Little Learners Learning", role: "platform" }, null)).toBe("/about");
    expect(resolveAuthorProfileHref({ name: "Little Learners Learning", role: "platform" }, makeTeacher())).toBe(
      "/about",
    );
  });

  it("links a teacher author to their real public profile when this browser holds a matching, viewable profile", () => {
    const teacher = makeTeacher();
    const href = resolveAuthorProfileHref({ name: teacher.name, role: "teacher", teacherId: teacher.id }, teacher);
    expect(href).toBe(`/teachers/p/${teacher.slug}`);
  });

  it("does not link when no teacher profile exists in this browser", () => {
    expect(resolveAuthorProfileHref({ name: "Someone", role: "teacher", teacherId: "t1" }, null)).toBeUndefined();
  });

  it("does not link when the browser's teacher profile is a different person", () => {
    const teacher = makeTeacher({ id: "t1" });
    const href = resolveAuthorProfileHref({ name: "Someone Else", role: "teacher", teacherId: "t2" }, teacher);
    expect(href).toBeUndefined();
  });

  it("does not link when the matching teacher's profile isn't publicly viewable", () => {
    const privateTeacher = makeTeacher({ visibility: "private" });
    const href = resolveAuthorProfileHref(
      { name: privateTeacher.name, role: "teacher", teacherId: privateTeacher.id },
      privateTeacher,
    );
    expect(href).toBeUndefined();
  });

  it("does not link when the matching teacher's profile is rejected or hidden", () => {
    const rejectedTeacher = makeTeacher({ moderationStatus: "rejected" });
    const href = resolveAuthorProfileHref(
      { name: rejectedTeacher.name, role: "teacher", teacherId: rejectedTeacher.id },
      rejectedTeacher,
    );
    expect(href).toBeUndefined();
  });

  it("does not link when the matching teacher's account is deactivated", () => {
    const deactivatedTeacher = makeTeacher({ accountStatus: "deactivated" });
    const href = resolveAuthorProfileHref(
      { name: deactivatedTeacher.name, role: "teacher", teacherId: deactivatedTeacher.id },
      deactivatedTeacher,
    );
    expect(href).toBeUndefined();
  });
});
