"use client";

import * as React from "react";
import {
  addLocalTeacherResource,
  deleteLocalTeacherResource,
  getLocalTeacherResourcesSnapshot,
  getServerTeacherResourcesSnapshot,
  subscribeLocalTeacherResources,
  updateLocalTeacherResource,
  type NewTeacherResource,
  type TeacherResourceUpdates,
} from "./local-teacher-resources";

/**
 * Same useSyncExternalStore pattern as useChildProfiles/useTeacherProfile —
 * see local-teacher-resources.ts for why. `ready` distinguishes "still
 * reading localStorage" from "genuinely has none yet."
 */
export function useTeacherResources() {
  const resources = React.useSyncExternalStore(
    subscribeLocalTeacherResources,
    getLocalTeacherResourcesSnapshot,
    getServerTeacherResourcesSnapshot,
  );
  const ready = resources !== getServerTeacherResourcesSnapshot();

  const addResource = React.useCallback(
    (teacherId: string, teacherName: string, resource: NewTeacherResource, status?: "draft" | "published") => {
      addLocalTeacherResource(teacherId, teacherName, resource, status);
    },
    [],
  );

  const updateResource = React.useCallback((id: string, updates: TeacherResourceUpdates) => {
    updateLocalTeacherResource(id, updates);
  }, []);

  const deleteResource = React.useCallback((id: string) => {
    deleteLocalTeacherResource(id);
  }, []);

  return { resources, ready, addResource, updateResource, deleteResource };
}
