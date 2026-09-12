"use client";

import * as React from "react";
import {
  createLocalTeacherAccount,
  getLocalTeacherSnapshot,
  getServerTeacherSnapshot,
  setLocalTeacherAccountStatus,
  setLocalTeacherModerationStatus,
  setLocalTeacherVerified,
  setLocalTeacherVisibility,
  subscribeLocalTeacher,
  updateLocalTeacherProfile,
  type NewTeacherAccount,
  type TeacherProfileUpdates,
} from "./local-teacher";
import type { TeacherProfile } from "./types";

/**
 * Same useSyncExternalStore pattern as useChildProfiles — the server and
 * the client's first paint agree on the same placeholder (no hydration
 * mismatch), and every component using this hook re-renders the instant
 * the local teacher record is created or updated. `ready` is "has this
 * snapshot actually been read from storage yet" (see local-teacher.ts for
 * why that's `undefined` vs. `null`, not a separate state flag) — so
 * callers can show a brief loading state instead of a flash of "no
 * account" for someone who actually has one.
 */
export function useTeacherProfile() {
  const snapshot = React.useSyncExternalStore(
    subscribeLocalTeacher,
    getLocalTeacherSnapshot,
    getServerTeacherSnapshot,
  );
  const ready = snapshot !== undefined;
  const teacher = ready ? snapshot : null;

  const createAccount = React.useCallback((account: NewTeacherAccount) => {
    return createLocalTeacherAccount(account);
  }, []);

  const updateProfile = React.useCallback((updates: TeacherProfileUpdates) => {
    return updateLocalTeacherProfile(updates);
  }, []);

  const setVisibility = React.useCallback((visibility: TeacherProfile["visibility"]) => {
    return setLocalTeacherVisibility(visibility);
  }, []);

  const setModerationStatus = React.useCallback((moderationStatus: TeacherProfile["moderationStatus"]) => {
    return setLocalTeacherModerationStatus(moderationStatus);
  }, []);

  const setVerified = React.useCallback((verified: boolean) => {
    return setLocalTeacherVerified(verified);
  }, []);

  const setAccountStatus = React.useCallback((accountStatus: TeacherProfile["accountStatus"]) => {
    return setLocalTeacherAccountStatus(accountStatus);
  }, []);

  return {
    teacher,
    ready,
    createAccount,
    updateProfile,
    setVisibility,
    setModerationStatus,
    setVerified,
    setAccountStatus,
  };
}
