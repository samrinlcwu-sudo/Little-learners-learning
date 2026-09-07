import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/patterns/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your Little Learners Learning account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
