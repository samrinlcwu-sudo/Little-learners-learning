import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/patterns/admin-sidebar";
import { AdminHeader } from "@/components/patterns/admin-header";

/**
 * The shared shell for every real admin page, i.e. everything Proxy
 * (`src/proxy.ts`) actually gates. Reaching any page rendered inside this
 * layout already proves a valid signed session exists (Proxy runs first,
 * on every request) — so this is simply "Signed in as admin" scaffolding,
 * not another access check; duplicating one here would be exactly the
 * redundant, easy-to-drift client-side check the brief warns against.
 * `/admin/login` sits outside this route group on purpose, so it never
 * shows this shell.
 *
 * Prompt 64 restructures this from a single top bar into a professional
 * dashboard shell — a persistent sidebar on desktop (`AdminSidebar`), a
 * header with a mobile nav toggle / notifications / account menu
 * (`AdminHeader`) — without changing what it protects or how: the
 * security model is entirely Proxy's, unchanged by this prompt.
 */
export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
