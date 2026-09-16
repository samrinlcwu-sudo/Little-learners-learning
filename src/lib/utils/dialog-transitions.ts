/**
 * The open/close transition classes every Radix Dialog/DropdownMenu
 * overlay and content panel in this codebase used — previously typed out
 * by hand, identically, in five separate files (`modal.tsx`,
 * `dropdown-menu.tsx`, `ai-assistant-panel.tsx`, `notification-center.tsx`,
 * `site-search.tsx`). Frontend runtime audit, Prompt 81: consolidated to
 * one place so there's a single definition to update, and switched from
 * the bare `animate-in`/`animate-out` utilities to their `motion-safe:`
 * form — a user who has requested reduced motion
 * (`prefers-reduced-motion: reduce`) now gets an instant show/hide with
 * no animation classes applied at all, instead of the fade/zoom every
 * dialog previously always played regardless of that preference.
 */
export const DIALOG_OVERLAY_TRANSITION =
  "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out";

export const DIALOG_CONTENT_TRANSITION =
  "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in motion-safe:data-[state=open]:zoom-in-95 motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out motion-safe:data-[state=closed]:zoom-out-95";
