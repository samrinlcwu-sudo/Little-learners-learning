"use client";

import { ShieldCheck, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAdminSignOut } from "@/components/patterns/admin-sign-out-button";

/**
 * The "account/profile menu" the brief asks for — deliberately honest
 * about what this codebase actually has: one shared admin passphrase, not
 * a multi-admin accounts table (docs/ADMIN_ARCHITECTURE.md, "'Parent' and
 * 'Administrator' are deliberately absent as rows"). So this shows a
 * generic "Admin session" label, never an invented name, email, or
 * avatar — the same restraint every other "no real identity yet" surface
 * in this codebase already applies.
 */
function AdminAccountMenu() {
  const { signOut, pending } = useAdminSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-ink transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">Admin</span>
          <ChevronDown className="size-4 text-neutral-400" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Signed in as Admin</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut} disabled={pending}>
          <LogOut className="mr-2 size-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AdminAccountMenu };
