import type { Metadata } from "next";
import { AdminTeacherDetail } from "@/components/patterns/admin-teacher-detail";

export const metadata: Metadata = {
  title: "Teacher Review",
  description: "Admin teacher review for Little Learners Learning.",
  robots: { index: false, follow: false },
};

export default function AdminTeacherDetailPage() {
  return <AdminTeacherDetail />;
}
