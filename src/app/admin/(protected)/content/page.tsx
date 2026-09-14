import type { Metadata } from "next";
import { AdminContentTabs } from "@/components/patterns/admin-content-tabs";

export const metadata: Metadata = {
  title: "Content Library",
  description: "Admin content library for Little Learners Learning.",
  robots: { index: false, follow: false },
};

export default function AdminContentPage() {
  return <AdminContentTabs />;
}
