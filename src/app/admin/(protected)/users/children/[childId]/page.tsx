import type { Metadata } from "next";
import { AdminChildDetail } from "@/components/patterns/admin-child-detail";

/**
 * A child's real data lives only in this browser's localStorage
 * (src/lib/accounts/local-children.ts) — the server never sees it, so
 * this metadata (and the URL, which uses an opaque id) can't leak it,
 * matching the same pattern `/dashboard/children/[childId]` already
 * follows.
 */
export const metadata: Metadata = {
  title: "Child Account",
  description: "Admin child account management for Little Learners Learning.",
  robots: { index: false, follow: false },
};

export default function AdminChildDetailPage() {
  return <AdminChildDetail />;
}
