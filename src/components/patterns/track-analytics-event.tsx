"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track";
import type { AnalyticsEventName, AnalyticsEventProperties } from "@/lib/analytics/types";

export interface TrackAnalyticsEventProps {
  name: AnalyticsEventName;
  properties?: AnalyticsEventProperties;
}

/**
 * Renders nothing — fires one anonymous, aggregate analytics event when
 * the page it's placed on mounts. Deliberately separate from
 * `TrackPageView` (`./track-page-view.tsx`): that component records real,
 * per-child learning progress; this one records anonymous site usage and
 * never touches a child profile, so the two concerns can never bleed into
 * each other by sharing a code path. See docs/SEARCH_MONITORING_PLAN.md.
 */
function TrackAnalyticsEvent({ name, properties }: TrackAnalyticsEventProps) {
  useEffect(() => {
    trackEvent(name, properties);
    // Only ever fire once, when this page is first opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export { TrackAnalyticsEvent };
