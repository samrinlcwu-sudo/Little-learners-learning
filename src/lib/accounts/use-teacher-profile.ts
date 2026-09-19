"use client";

import * as React from "react";
import {
  fetchOwnTeacherProfile,
  setOwnTeacherVisibility,
  updateOwnTeacherProfile,
  type TeacherProfileUpdates,
} from "./remote-teacher";
import { useSupabaseUser } from "@/lib/supabase/use-supabase-user";
import type { TeacherProfile } from "./types";

/**
 * The real, Supabase-backed replacement for the old `useSyncExternalStore`
 * + `localStorage` version (Prompt 110 — see
 * docs/AUTHENTICATION_BACKEND_AUDIT.md). Real account creation
 * (`supabase.auth.signUp`) happens in `teacher-register-form.tsx` itself,
 * not here — this hook only ever reads/writes the *profile row* for
 * whoever is currently signed in, scoped by Row Level Security to
 * `id = auth.uid()`.
 *
 * `setModerationStatus`/`setVerified`/`setAccountStatus` are deliberately
 * absent from this hook — those are admin-only actions with no real write
 * path yet (a database trigger locks all three columns against ordinary
 * updates); see `use-admin-local-teacher.ts` for where the admin panel's
 * versions of those actions still live.
 */
export function useTeacherProfile() {
  const { user, ready: userReady } = useSupabaseUser();
  const [teacher, setTeacher] = React.useState<TeacherProfile | null>(null);
  const [dataReady, setDataReady] = React.useState(false);

  // Fetches directly rather than delegating to `refresh` below — see the
  // matching comment in use-child-profiles.ts for why.
  React.useEffect(() => {
    if (!userReady) return;
    let active = true;
    const promise = user ? fetchOwnTeacherProfile() : Promise.resolve<TeacherProfile | null>(null);
    promise.then((profile) => {
      if (!active) return;
      setTeacher(profile);
      setDataReady(true);
    });
    return () => {
      active = false;
    };
  }, [userReady, user]);

  const refresh = React.useCallback(async () => {
    if (!user) {
      setTeacher(null);
      setDataReady(true);
      return;
    }
    setDataReady(false);
    try {
      const profile = await fetchOwnTeacherProfile();
      setTeacher(profile);
    } finally {
      setDataReady(true);
    }
  }, [user]);

  const updateProfile = React.useCallback(async (updates: TeacherProfileUpdates) => {
    const updated = await updateOwnTeacherProfile(updates);
    setTeacher(updated);
    return updated;
  }, []);

  const setVisibility = React.useCallback(async (visibility: TeacherProfile["visibility"]) => {
    const updated = await setOwnTeacherVisibility(visibility);
    setTeacher(updated);
    return updated;
  }, []);

  return { teacher, ready: userReady && dataReady, updateProfile, setVisibility, refresh };
}
