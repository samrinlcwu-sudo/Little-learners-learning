import type { Metadata } from "next";
import { AdminUserList } from "@/components/patterns/admin-user-list";

export const metadata: Metadata = {
  title: "User Management",
  description: "Admin user management for Little Learners Learning.",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return <AdminUserList />;
}
