"use client";

import * as React from "react";
import {
  createDraftApplication,
  deleteDraftApplication,
  fetchApplications,
  submitApplication,
  updateDraftApplication,
  withdrawApplication,
  type ApplicationUpdates,
  type NewApplication,
} from "./remote-applications";
import { useSupabaseUser } from "@/lib/supabase/use-supabase-user";
import { createNotification } from "@/lib/notifications/local-notifications";
import type { Application } from "./types";

/**
 * The real, Supabase-backed replacement for the old `useSyncExternalStore`
 * + `localStorage` version (Prompt 110 — see
 * docs/AUTHENTICATION_BACKEND_AUDIT.md). Every action is now genuinely
 * async (a real network call, not a synchronous local read/write) — every
 * call site was updated accordingly. Notifications
 * (`local-notifications.ts`) stay local-only on purpose: they're a
 * lightweight, per-device inbox, not part of the account data this prompt
 * migrates.
 */
export function useApplications() {
  const { user, ready: userReady } = useSupabaseUser();
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [dataReady, setDataReady] = React.useState(false);

  // Fetches directly rather than delegating to `refresh` below — calling a
  // function that itself calls setState from inside an effect is exactly
  // the pattern react-hooks' set-state-in-effect rule flags.
  React.useEffect(() => {
    if (!userReady) return;
    let active = true;
    const promise = user ? fetchApplications() : Promise.resolve<Application[]>([]);
    promise.then((rows) => {
      if (!active) return;
      setApplications(rows);
      setDataReady(true);
    });
    return () => {
      active = false;
    };
  }, [userReady, user]);

  const refresh = React.useCallback(async () => {
    if (!user) {
      setApplications([]);
      setDataReady(true);
      return;
    }
    setDataReady(false);
    try {
      const rows = await fetchApplications();
      setApplications(rows);
    } finally {
      setDataReady(true);
    }
  }, [user]);

  const createApplication = React.useCallback(async (input?: NewApplication) => {
    const created = await createDraftApplication(input);
    setApplications((current) => [created, ...current]);
    return created;
  }, []);

  const updateApplication = React.useCallback(async (id: string, updates: ApplicationUpdates) => {
    const updated = await updateDraftApplication(id, updates);
    setApplications((current) => current.map((application) => (application.id === id ? updated : application)));
    return updated;
  }, []);

  const submit = React.useCallback(async (id: string) => {
    const result = await submitApplication(id);
    if (result) {
      setApplications((current) => current.map((application) => (application.id === id ? result : application)));
      createNotification({
        recipientAccountId: result.parentAccountId,
        type: "application-update",
        title: "Application submitted",
        message: result.referenceNumber
          ? `Reference ${result.referenceNumber}. There's no live review connected yet, so it'll stay at "Submitted" for now.`
          : "Your application was submitted.",
        relatedEntity: { kind: "application", id: result.id },
        action: { label: "View application", href: `/dashboard/applications/${result.id}` },
      });
    }
    return result;
  }, []);

  const withdraw = React.useCallback(async (id: string) => {
    const updated = await withdrawApplication(id);
    if (updated?.status === "withdrawn") {
      setApplications((current) => current.map((application) => (application.id === id ? updated : application)));
      createNotification({
        recipientAccountId: updated.parentAccountId,
        type: "application-update",
        title: "Application withdrawn",
        message: "This application has been withdrawn and is now closed.",
        relatedEntity: { kind: "application", id: updated.id },
        action: { label: "View application", href: `/dashboard/applications/${updated.id}` },
      });
    }
  }, []);

  const deleteDraft = React.useCallback(async (id: string) => {
    await deleteDraftApplication(id);
    setApplications((current) => current.filter((application) => application.id !== id));
  }, []);

  return {
    applications,
    ready: userReady && dataReady,
    createApplication,
    updateApplication,
    submit,
    withdraw,
    deleteDraft,
    refresh,
  };
}
