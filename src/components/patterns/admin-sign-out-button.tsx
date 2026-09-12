"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordAdminAuditEvent } from "@/lib/admin/audit-log";
import { adminLogoutAction } from "@/lib/admin/actions";

/** Clears the real server-side session cookie, records the real audit event, then navigates — same order and reasoning as `AdminLoginForm`. */
function AdminSignOutButton() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleClick() {
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

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={pending}>
      <LogOut aria-hidden="true" />
      Sign out
    </Button>
  );
}

export { AdminSignOutButton };
