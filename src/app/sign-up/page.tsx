import type { Metadata } from "next";
import { SignUpForm } from "@/components/patterns/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Little Learners Learning account.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
