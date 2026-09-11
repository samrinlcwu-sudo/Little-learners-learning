"use client";

import * as React from "react";
import {
  createDraftApplication,
  deleteDraftApplication,
  getLocalApplicationsSnapshot,
  getServerApplicationsSnapshot,
  submitApplication,
  subscribeLocalApplications,
  updateDraftApplication,
  withdrawApplication,
  type ApplicationUpdates,
  type NewApplication,
} from "./local-applications";

/**
 * Same useSyncExternalStore pattern as every other local-first store in
 * this codebase (use-child-profiles.ts, use-teacher-resources.ts) — the
 * server and the client's first paint agree on the same empty snapshot, so
 * there's no hydration mismatch, and every subscribed component re-renders
 * the instant an application is created, edited, submitted, or withdrawn.
 */
export function useApplications() {
  const applications = React.useSyncExternalStore(
    subscribeLocalApplications,
    getLocalApplicationsSnapshot,
    getServerApplicationsSnapshot,
  );
  const ready = applications !== getServerApplicationsSnapshot();

  const createApplication = React.useCallback((input?: NewApplication) => {
    return createDraftApplication(input);
  }, []);

  const updateApplication = React.useCallback((id: string, updates: ApplicationUpdates) => {
    updateDraftApplication(id, updates);
  }, []);

  const submit = React.useCallback((id: string) => {
    return submitApplication(id);
  }, []);

  const withdraw = React.useCallback((id: string) => {
    withdrawApplication(id);
  }, []);

  const deleteDraft = React.useCallback((id: string) => {
    deleteDraftApplication(id);
  }, []);

  return { applications, ready, createApplication, updateApplication, submit, withdraw, deleteDraft };
}
