import type { Metadata } from "next";
import { ApplicationDetail } from "@/components/patterns/application-detail";

/**
 * An application's real content (child, learning interests, message) lives
 * only in this browser's localStorage — the server never sees it, so this
 * metadata (and the URL, which uses an opaque id) can't leak it, the same
 * reasoning as the child dashboard route.
 */
export const metadata: Metadata = {
  title: "Application",
  description: "An application on Little Learners Learning.",
  robots: { index: false, follow: false },
};

export default function ApplicationDetailPage() {
  return <ApplicationDetail />;
}
