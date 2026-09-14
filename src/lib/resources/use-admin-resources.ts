"use client";

import * as React from "react";
import {
  addLocalAdminResource,
  deleteLocalAdminResource,
  getLocalAdminResourcesSnapshot,
  getServerAdminResourcesSnapshot,
  setLocalAdminResourceStatus,
  subscribeLocalAdminResources,
  updateLocalAdminResource,
  type AdminResourceUpdates,
  type NewAdminResource,
} from "./local-admin-resources";
import type { Resource } from "./types";

/** Same useSyncExternalStore pattern as useTeacherResources — see local-admin-resources.ts for why. */
export function useAdminResources() {
  const resources = React.useSyncExternalStore(
    subscribeLocalAdminResources,
    getLocalAdminResourcesSnapshot,
    getServerAdminResourcesSnapshot,
  );
  const ready = resources !== getServerAdminResourcesSnapshot();

  const addResource = React.useCallback((resource: NewAdminResource, status?: "draft" | "review") => {
    addLocalAdminResource(resource, status);
  }, []);

  const updateResource = React.useCallback((id: string, updates: AdminResourceUpdates) => {
    updateLocalAdminResource(id, updates);
  }, []);

  const deleteResource = React.useCallback((id: string) => {
    deleteLocalAdminResource(id);
  }, []);

  const setStatus = React.useCallback((id: string, status: Resource["publicationStatus"]) => {
    setLocalAdminResourceStatus(id, status);
  }, []);

  return { resources, ready, addResource, updateResource, deleteResource, setStatus };
}
