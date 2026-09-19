"use client";

import * as React from "react";
import { addChildProfile, fetchChildProfiles, updateChildProfile, type NewChildProfile } from "./remote-children";
import { useSupabaseUser } from "@/lib/supabase/use-supabase-user";
import type { ChildProfile } from "./types";

/**
 * The real, Supabase-backed replacement for the old `useSyncExternalStore`
 * + `localStorage` version (Prompt 110 — see
 * docs/AUTHENTICATION_BACKEND_AUDIT.md). Every read/write is scoped to the
 * signed-in parent by Postgres Row Level Security on `child_profiles`, not
 * by anything in this hook — a query simply returns nothing for another
 * parent's rows. `ready` now means "we know who's signed in and have
 * fetched their children," not just "localStorage has been read."
 *
 * The admin panel does NOT use this hook — see
 * `use-admin-local-children.ts` for why it stays on the old local-only
 * source.
 */
export function useChildProfiles() {
  const { user, ready: userReady } = useSupabaseUser();
  const [children, setChildren] = React.useState<ChildProfile[]>([]);
  const [dataReady, setDataReady] = React.useState(false);

  // Effect body fetches directly rather than delegating to `refresh` below
  // — calling a function that itself calls setState from inside an effect
  // is exactly the pattern react-hooks' set-state-in-effect rule flags, so
  // the initial load and the exposed manual-refresh action are kept as two
  // separate (if similar) code paths rather than one shared callback.
  React.useEffect(() => {
    if (!userReady) return;
    let active = true;
    const promise = user ? fetchChildProfiles() : Promise.resolve<ChildProfile[]>([]);
    promise.then((rows) => {
      if (!active) return;
      setChildren(rows);
      setDataReady(true);
    });
    return () => {
      active = false;
    };
  }, [userReady, user]);

  const refresh = React.useCallback(async () => {
    if (!user) {
      setChildren([]);
      setDataReady(true);
      return;
    }
    setDataReady(false);
    try {
      const rows = await fetchChildProfiles();
      setChildren(rows);
    } finally {
      setDataReady(true);
    }
  }, [user]);

  const addChild = React.useCallback(
    async (child: NewChildProfile) => {
      const created = await addChildProfile(child);
      setChildren((current) => [...current, created]);
      return created;
    },
    [],
  );

  const updateChild = React.useCallback(async (id: string, updates: NewChildProfile) => {
    const updated = await updateChildProfile(id, updates);
    setChildren((current) => current.map((child) => (child.id === id ? updated : child)));
    return updated;
  }, []);

  return { children, ready: userReady && dataReady, addChild, updateChild, refresh };
}
