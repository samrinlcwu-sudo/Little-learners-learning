"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { recordAdminAuditEvent } from "@/lib/admin/audit-log";
import { adminLoginAction, type AdminLoginState } from "@/lib/admin/actions";

const initialState: AdminLoginState = {};

export interface AdminLoginFormProps {
  /** Where to send a successfully authenticated admin — validated to stay under /admin, never an open redirect to an arbitrary URL. */
  redirectTo: string;
}

/**
 * The real login form for the real server-side gate `src/middleware.ts`
 * enforces (Prompt 57, docs/ADMIN_ARCHITECTURE.md). `adminLoginAction`
 * does the actual passphrase check and sets the session cookie
 * server-side; this component only reacts to its result — it never
 * decides on its own whether the passphrase was correct.
 */
function AdminLoginForm({ redirectTo }: AdminLoginFormProps) {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState);
  const router = useRouter();

  React.useEffect(() => {
    if (state.success) {
      recordAdminAuditEvent({
        action: "admin.login",
        targetType: "session",
        details: "Signed in to the admin area.",
      });
      router.replace(redirectTo);
      router.refresh();
    }
  }, [state.success, redirectTo, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="admin-passphrase">Admin passphrase</Label>
        <PasswordInput id="admin-passphrase" name="passphrase" required disabled={pending} />
      </div>

      {state.error && (
        <p className="flex items-center gap-1.5 text-sm text-error-700">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export { AdminLoginForm };
