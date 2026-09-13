import type { Metadata } from "next";
import { AdminParentDetail } from "@/components/patterns/admin-parent-detail";

/**
 * A family's real data lives only in this browser's localStorage
 * (src/lib/accounts/local-children.ts) — the server never sees it, so
 * this metadata (and the URL, which uses an opaque id) can't leak it,
 * matching the same pattern `/admin/users/children/[childId]` already
 * follows.
 */
export const metadata: Metadata = {
  title: "Parent Account",
  description: "Admin parent account management for Little Learners Learning.",
  robots: { index: false, follow: false },
};

export default function AdminParentDetailPage() {
  return <AdminParentDetail />;
}
