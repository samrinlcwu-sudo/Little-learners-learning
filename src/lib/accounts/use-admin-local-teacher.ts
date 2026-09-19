"use client";

import * as React from "react";
import {
  getLocalTeacherSnapshot,
  getServerTeacherSnapshot,
  setLocalTeacherAccountStatus,
  setLocalTeacherModerationStatus,
  setLocalTeacherVerified,
  subscribeLocalTeacher,
} from "./local-teacher";
import type { TeacherProfile } from "./types";

/**
 * The admin panel's own moderation controls for a teacher profile —
 * deliberately kept on the pre-Prompt-110 local-storage source, for the
 * same reason as `use-admin-local-children.ts`: the admin system has no
 * Supabase session, so it has no way to reach a real teacher's row under
 * Row Level Security. A real cross-account moderation path needs a
 * service-role server route, out of scope for this pass — see
 * docs/AUTHENTICATION_BACKEND_AUDIT.md, "Remaining Limitations."
 */
export function useAdminLocalTeacherProfile() {
  const snapshot = React.useSyncExternalStore(
    subscribeLocalTeacher,
    getLocalTeacherSnapshot,
    getServerTeacherSnapshot,
  );
  const ready = snapshot !== undefined;
  const teacher = ready ? snapshot : null;

  const setModerationStatus = React.useCallback((moderationStatus: TeacherProfile["moderationStatus"]) => {
    return setLocalTeacherModerationStatus(moderationStatus);
  }, []);

  const setVerified = React.useCallback((verified: boolean) => {
    return setLocalTeacherVerified(verified);
  }, []);

  const setAccountStatus = React.useCallback((accountStatus: TeacherProfile["accountStatus"]) => {
    return setLocalTeacherAccountStatus(accountStatus);
  }, []);

  return { teacher, ready, setModerationStatus, setVerified, setAccountStatus };
}
