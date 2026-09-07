"use client";

import { useEffect } from "react";
import { recordProgressEvent } from "@/lib/progress/local-progress";
import type { ProgressEventType } from "@/lib/progress/types";

export interface TrackPageViewProps {
  type: Extract<ProgressEventType, "topic_explored" | "resource_viewed">;
  topic?: string;
  activityLabel: string;
  activityHref: string;
}

/**
 * Renders nothing — records one event when the page it's placed on mounts,
 * attributed to whichever child is currently active (see
 * src/lib/progress/local-progress.ts). If no child is active, recording is
 * a no-op, so a parent browsing on their own never generates fake activity
 * for a child who wasn't actually using the site.
 */
function TrackPageView({ type, topic, activityLabel, activityHref }: TrackPageViewProps) {
  useEffect(() => {
    recordProgressEvent({ type, topic, activityLabel, activityHref });
    // Only ever fire once, when this page is first opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export { TrackPageView };
