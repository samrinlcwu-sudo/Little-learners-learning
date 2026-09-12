"use client";

import * as React from "react";
import {
  addLocalChild,
  getLocalChildrenSnapshot,
  getServerChildrenSnapshot,
  setLocalChildAccountStatus,
  subscribeLocalChildren,
  updateLocalChild,
  type NewChildProfile,
} from "./local-children";
import type { ChildProfile } from "./types";

/**
 * `useSyncExternalStore` reads localStorage (an external data source, not
 * React state) the correct way: the server and the client's first paint
 * both get the same empty snapshot (see `local-children.ts`), so there's
 * no hydration mismatch, and every component using this hook re-renders
 * automatically the moment `addChild`/`updateChild` writes something —
 * even in the same tab. `ready` is just "does this snapshot differ from
 * the server's placeholder," so callers can show a brief loading state
 * instead of a flash of "no children yet" for someone who actually has some.
 */
export function useChildProfiles() {
  const children = React.useSyncExternalStore(
    subscribeLocalChildren,
    getLocalChildrenSnapshot,
    getServerChildrenSnapshot,
  );
  const ready = children !== getServerChildrenSnapshot();

  const addChild = React.useCallback((child: NewChildProfile) => {
    addLocalChild(child);
  }, []);

  const updateChild = React.useCallback((id: string, updates: NewChildProfile) => {
    updateLocalChild(id, updates);
  }, []);

  const setAccountStatus = React.useCallback((id: string, accountStatus: ChildProfile["accountStatus"]) => {
    setLocalChildAccountStatus(id, accountStatus);
  }, []);

  return { children, ready, addChild, updateChild, setAccountStatus };
}
