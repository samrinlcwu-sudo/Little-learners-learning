import type { Metadata } from "next";
import { ParentDashboard } from "@/components/patterns/parent-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Little Learners Learning parent dashboard.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <ParentDashboard />;
}
