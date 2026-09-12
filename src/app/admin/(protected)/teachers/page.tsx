import type { Metadata } from "next";
import { AdminTeacherList } from "@/components/patterns/admin-teacher-list";

/**
 * A teacher's real profile data lives only in this browser's localStorage
 * (src/lib/accounts/local-teacher.ts) — the server never sees it, so this
 * metadata (and the URL) can't leak it. Never indexed — admin surfaces
 * must never be discoverable, see docs/ADMIN_ARCHITECTURE.md.
 */
export const metadata: Metadata = {
  title: "Teacher Management",
  description: "Admin teacher management for Little Learners Learning.",
  robots: { index: false, follow: false },
};

export default function AdminTeachersPage() {
  return <AdminTeacherList />;
}
