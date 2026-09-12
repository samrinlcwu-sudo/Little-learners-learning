import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AdminSignOutButton } from "@/components/patterns/admin-sign-out-button";

/**
 * The shared shell for every real admin page, i.e. everything the
 * middleware (`src/middleware.ts`) actually gates. Reaching any page
 * rendered inside this layout already proves a valid signed session
 * exists (the middleware runs first, on every request) — so this is
 * simply "Sign in as admin" scaffolding, not another access check;
 * duplicating one here would be exactly the redundant, easy-to-drift
 * client-side check the brief warns against. `/admin/login` sits outside
 * this route group on purpose, so it never shows this bar.
 */
export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 bg-ink text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 font-display text-sm font-semibold">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Admin
            </Link>
            <nav aria-label="Admin" className="flex items-center gap-4 text-sm">
              <Link href="/admin/teachers" className="text-neutral-300 transition-colors hover:text-white">
                Teachers
              </Link>
              <Link href="/admin/users" className="text-neutral-300 transition-colors hover:text-white">
                Users
              </Link>
            </nav>
          </div>
          <AdminSignOutButton />
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
