import type { Metadata } from "next";
import { AdminResourceDetail } from "@/components/patterns/admin-resource-detail";

export const metadata: Metadata = {
  title: "Resource Detail",
  description: "Admin resource detail for Little Learners Learning.",
  robots: { index: false, follow: false },
};

export default function AdminResourceDetailPage() {
  return <AdminResourceDetail />;
}
