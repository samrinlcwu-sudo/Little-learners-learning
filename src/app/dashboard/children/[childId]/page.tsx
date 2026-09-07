import type { Metadata } from "next";
import { ChildExperience } from "@/components/patterns/child-experience";

/**
 * The child's real name lives only in this browser's localStorage — the
 * server never sees it, so it's structurally impossible for this metadata
 * (or the URL, which uses an opaque id) to leak it. See
 * docs/ACCOUNTS_ARCHITECTURE.md.
 */
export const metadata: Metadata = {
  title: "Learning Time",
  description: "A child's learning space on Little Learners Learning.",
  robots: { index: false, follow: false },
};

export default function ChildDashboardPage() {
  return <ChildExperience />;
}
