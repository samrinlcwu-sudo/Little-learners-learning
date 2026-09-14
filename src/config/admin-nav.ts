import { LayoutDashboard, Users, GraduationCap, Library, type LucideIcon } from "lucide-react";

/**
 * Single source of truth for the admin sidebar/mobile nav — same
 * "one config, every surface reads it" convention `src/config/nav.ts`
 * already establishes for the public site. Only real, working admin
 * routes belong here (Prompt 64: "Only expose sections that actually
 * exist in the current implementation"). Applications, Business, SEO, and
 * Settings are real future admin sections (see the "Roadmap" panel on
 * `/admin`), but none has a page yet, so none is a link here — adding one
 * later is exactly one object in this array, automatically picked up by
 * both the desktop sidebar and the mobile nav.
 */
export interface AdminNavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNav: AdminNavLink[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Teachers", href: "/admin/teachers", icon: GraduationCap },
  { label: "Content", href: "/admin/content", icon: Library },
];
