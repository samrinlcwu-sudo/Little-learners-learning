import type { Metadata } from "next";
import { TeacherProfilePage } from "@/components/patterns/teacher-profile-page";

export const metadata: Metadata = {
  title: "Complete Your Profile",
  description: "Complete your Little Learners Learning teacher profile.",
  robots: { index: false, follow: false },
};

export default function TeacherRegisterProfilePage() {
  return <TeacherProfilePage />;
}
