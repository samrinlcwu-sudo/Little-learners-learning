import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/patterns/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Little Learners Learning password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
