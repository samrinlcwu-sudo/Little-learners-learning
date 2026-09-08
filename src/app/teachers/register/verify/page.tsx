import type { Metadata } from "next";
import { TeacherVerifyNotice } from "@/components/patterns/teacher-verify-notice";

export const metadata: Metadata = {
  title: "Verify Your Email",
  description: "Verify your Little Learners Learning teacher account.",
  robots: { index: false, follow: false },
};

export default function TeacherVerifyPage() {
  return <TeacherVerifyNotice />;
}
