import type { Metadata } from "next";
import { AdminResourceCreate } from "@/components/patterns/admin-resource-create";

export const metadata: Metadata = {
  title: "New Resource",
  description: "Create a new resource for the Little Learners Learning content library.",
  robots: { index: false, follow: false },
};

export default function NewAdminResourcePage() {
  return <AdminResourceCreate />;
}
