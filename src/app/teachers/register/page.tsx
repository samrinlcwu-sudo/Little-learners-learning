import type { Metadata } from "next";
import { TeacherRegisterForm } from "@/components/patterns/teacher-register-form";

export const metadata: Metadata = {
  title: "Create Your Teacher Account",
  description: "Create a Little Learners Learning teacher account.",
  robots: { index: false, follow: false },
};

export default function TeacherRegisterPage() {
  return <TeacherRegisterForm />;
}
