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
import { createNotification } from "@/lib/notifications/local-notifications";

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
    const result = submitApplication(id);
    if (result) {
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

  const withdraw = React.useCallback((id: string) => {
    const results = withdrawApplication(id);
    const updated = results.find((application) => application.id === id);
    if (updated?.status === "withdrawn") {
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

  const deleteDraft = React.useCallback((id: string) => {
    deleteDraftApplication(id);
  }, []);

  return { applications, ready, createApplication, updateApplication, submit, withdraw, deleteDraft };
}
