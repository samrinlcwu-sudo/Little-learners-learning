import type { Metadata } from "next";
import { ApplicationsDashboard } from "@/components/patterns/applications-dashboard";

export const metadata: Metadata = {
  title: "Applications",
  description: "Your Little Learners Learning applications.",
  robots: { index: false, follow: false },
};

export default function ApplicationsPage() {
  return <ApplicationsDashboard />;
}
