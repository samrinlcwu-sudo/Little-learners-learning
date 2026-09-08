import type { Metadata } from "next";
import { TeacherDashboard } from "@/components/patterns/teacher-dashboard";

export const metadata: Metadata = {
  title: "Teacher Dashboard",
  description: "Your Little Learners Learning teacher dashboard.",
  robots: { index: false, follow: false },
};

export default function TeacherDashboardPage() {
  return <TeacherDashboard />;
}
