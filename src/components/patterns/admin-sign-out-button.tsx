"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordAdminAuditEvent } from "@/lib/admin/audit-log";
import { adminLogoutAction } from "@/lib/admin/actions";

/**
 * Clears the real server-side session cookie, records the real audit
 * event, then navigates — same order and reasoning as `AdminLoginForm`.
 * Shared by `AdminSignOutButton` (standalone) and `AdminAccountMenu`
 * (dropdown item) so the sign-out sequence exists in exactly one place.
 */
function useAdminSignOut() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function signOut() {
    setPending(true);
    await adminLogoutAction();
    recordAdminAuditEvent({
      action: "admin.logout",
      targetType: "session",
      details: "Signed out of the admin area.",
    });
    router.replace("/admin/login");
    router.refresh();
  }

  return { signOut, pending };
}

function AdminSignOutButton() {
  const { signOut, pending } = useAdminSignOut();

  return (
    <Button variant="ghost" size="sm" onClick={signOut} disabled={pending}>
      <LogOut aria-hidden="true" />
      Sign out
    </Button>
  );
}

export { AdminSignOutButton, useAdminSignOut };
