import type { Metadata } from "next";
import { AdminResourceEdit } from "@/components/patterns/admin-resource-edit";

export const metadata: Metadata = {
  title: "Edit Resource",
  description: "Edit a resource in the Little Learners Learning content library.",
  robots: { index: false, follow: false },
};

export default function EditAdminResourcePage() {
  return <AdminResourceEdit />;
}
