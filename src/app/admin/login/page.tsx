import type { Metadata } from "next";
import { AuthFormShell } from "@/components/patterns/auth-form-shell";
import { AdminLoginForm } from "@/components/patterns/admin-login-form";
import { Alert } from "@/components/ui/alert";
import { isAdminAuthConfigured } from "@/lib/admin/config";

export const metadata: Metadata = {
  title: "Admin Sign In",
  description: "Admin sign in for Little Learners Learning.",
  robots: { index: false, follow: false },
};

/** Only ever a same-origin path under /admin — never an arbitrary URL a crafted `from` param could redirect to. */
function sanitizeRedirect(from: string | undefined): string {
  if (!from || !from.startsWith("/admin") || from.startsWith("/admin/login")) {
    return "/admin";
  }
  return from;
}

/**
 * The real sign-in screen for the real server-side gate
 * (`src/middleware.ts`, docs/ADMIN_ARCHITECTURE.md). Deliberately not
 * behind the middleware's own check — someone with no session has to be
 * able to reach this page, or nobody could ever sign in.
 */
export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const fromParam = params.from;
  const from = sanitizeRedirect(Array.isArray(fromParam) ? fromParam[0] : fromParam);

  if (!isAdminAuthConfigured()) {
    return (
      <AuthFormShell title="Admin sign in" description="Little Learners Learning">
        <Alert variant="warning">
          Admin login isn&apos;t configured on this deployment yet — set <code>ADMIN_PASSPHRASE</code> and{" "}
          <code>ADMIN_SESSION_SECRET</code> (server-only environment variables, never{" "}
          <code>NEXT_PUBLIC_</code>-prefixed) to enable it. See docs/ADMIN_ARCHITECTURE.md.
        </Alert>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell title="Admin sign in" description="Little Learners Learning">
      <AdminLoginForm redirectTo={from} />
    </AuthFormShell>
  );
}
