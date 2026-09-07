import type { Metadata } from "next";
import { SignInForm } from "@/components/patterns/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Little Learners Learning account.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <SignInForm />;
}
