"use client";

import * as React from "react";
import {
  getLocalChildrenSnapshot,
  getServerChildrenSnapshot,
  setLocalChildAccountStatus,
  subscribeLocalChildren,
} from "./local-children";
import type { ChildProfile } from "./types";

/**
 * The admin panel's own read of child profiles — deliberately kept on the
 * pre-Prompt-110 local-storage source rather than switched to the real,
 * Supabase-backed `useChildProfiles()` (`./use-child-profiles.ts`).
 *
 * The admin system authenticates with a completely separate mechanism (a
 * shared passphrase, `src/lib/admin/session.ts`) that has no Supabase
 * session and therefore no `auth.uid()` — a real Supabase query scoped by
 * Row Level Security would simply return zero rows for it, not "every
 * child." Building a real, secure admin-side cross-account view requires
 * a service-role server route, deliberately out of scope for this pass
 * (see docs/AUTHENTICATION_BACKEND_AUDIT.md, "Remaining Limitations") —
 * rather than leave the admin child list silently broken, it keeps
 * reading the same local demo data it always has, exactly as before.
 */
export function useAdminLocalChildProfiles() {
  const children = React.useSyncExternalStore(
    subscribeLocalChildren,
    getLocalChildrenSnapshot,
    getServerChildrenSnapshot,
  );
  const ready = children !== getServerChildrenSnapshot();

  const setAccountStatus = React.useCallback((id: string, accountStatus: ChildProfile["accountStatus"]) => {
    setLocalChildAccountStatus(id, accountStatus);
  }, []);

  return { children, ready, setAccountStatus };
}
