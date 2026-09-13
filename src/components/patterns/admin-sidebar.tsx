import { AdminNavLinks } from "@/components/patterns/admin-nav-links";

/**
 * The persistent desktop nav rail (Prompt 64) — hidden below `lg`, where
 * `AdminHeader`'s collapsible mobile panel takes over instead, matching
 * the exact breakpoint `SiteHeader` already uses for the same reason.
 * Warm, off-white surface (`bg-surface-sunken`, the same cream token every
 * public page's alternate section background already uses) rather than a
 * flat white or grey panel — the brief's "must still belong to Little
 * Learners Learning" applied to the one piece of this shell with the most
 * visual real estate.
 */
function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-surface-sunken lg:flex">
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-5">
        <AdminNavLinks />
      </nav>
    </aside>
  );
}

export { AdminSidebar };
