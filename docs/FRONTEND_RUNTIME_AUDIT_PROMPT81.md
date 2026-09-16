# Frontend Code & Runtime Performance Audit (Prompt 81)

A codebase-wide audit for duplicated components, oversized components,
unnecessary re-renders, inefficient state management, duplicated
utilities, and animation/motion handling — following on from Prompt 79
(bundle/JS/font/caching) and Prompt 80 (images/assets), which already
covered the rest of this prompt's audit list (unused dependencies,
lazy-loading, request/caching behavior — this app has no backend, so
"repeated API calls," "pagination," and "stale data handling" don't
apply).

## Real problem found and fixed: duplicated dialog transitions with no reduced-motion support

The exact same Radix Dialog/DropdownMenu open-close transition classes
were hand-typed, identically, in **five separate files**:
`src/components/ui/modal.tsx`, `src/components/ui/dropdown-menu.tsx`,
`src/components/patterns/ai-assistant-panel.tsx`,
`src/components/patterns/notification-center.tsx`, and
`src/components/patterns/site-search.tsx`. Two problems from this
prompt's own audit list at once:

1. **Duplicated UI pattern** — the same `data-[state=open]:animate-in
   data-[state=open]:fade-in ...` string, copy-pasted five times, with no
   single place to change it.
2. **No `prefers-reduced-motion` support anywhere** — every one of these
   dialogs (the AI assistant, notifications, site search, every generic
   modal, every dropdown menu) always played its fade/zoom transition
   regardless of the visitor's OS-level reduced-motion setting.

**Fix**: `src/lib/utils/dialog-transitions.ts` — two exported constants,
`DIALOG_OVERLAY_TRANSITION` and `DIALOG_CONTENT_TRANSITION`, built with
Tailwind's `motion-safe:` variant instead of the bare `animate-in`/
`animate-out` utilities. A visitor with `prefers-reduced-motion: reduce`
now gets an instant show/hide with zero animation classes applied; every
other visitor gets the exact same fade/zoom transition as before. All
five files now import these two constants instead of retyping the class
list, so there's one definition to change in the future instead of five.

This was deliberately **not** turned into a shared `<Dialog>` wrapper
component: `Modal` (a generic confirm-style box), `AiAssistantPanel` (a
flex-column chat UI with a scrollable message list), `NotificationCenter`
(a flex-column list with its own header), and `SiteSearch` (top-anchored,
not vertically centered) each have genuinely different structural needs.
Forcing them into one generic component would have meant exactly the
"massive generic component that becomes harder to maintain" this
prompt's own instructions warn against — the duplication worth removing
was the transition *styling*, not the dialog *structure*.

## Everything else audited (confirmed already correct, not changed)

- **Component architecture**: cards (`ResourceCard`, `GameCard`,
  `BlogArticleCard`, `TeacherDirectoryCard`), buttons, badges, empty
  states (`EmptyState`), and the accordion are each a single shared
  component already reused everywhere that pattern appears — no
  duplicate/near-duplicate card or button implementation found anywhere
  in the codebase.
- **List rendering**: every `.map()` in the codebase keys on a real
  stable id/slug except one static, never-reordered list (blog article
  paragraphs, keyed by index) — not a real bug, since that list is
  rendered once from immutable data and never gains, loses, or reorders
  items.
- **State management / re-renders**: no state is duplicated between
  components that should share one source of truth; every "read
  localStorage" hook (`useChildProfiles`, `useTeacherProfile`, etc.) is
  the single owner of that data, read once per consuming component via a
  shared hook, not re-implemented ad hoc.
- **Expensive calculations**: the few `.filter()`/`.map()` chains outside
  simple list rendering (search relevance scoring, category journey
  computation) run over single-digit to low-double-digit item counts
  today — adding memoization here would optimize a cost that doesn't
  exist yet, not fix a real one.
- **Unused imports/dependencies**: `npx eslint .` (which includes
  no-unused-vars checking) is clean; the one previously-identified
  zero-cost dependency (`@supabase/*`, Prompt 79) is unchanged and still
  contributes zero bytes to any bundle.

## Testing performed

- `npx tsc --noEmit` — clean.
- `npx vitest run` — 46 files, 289 tests, all passing (no test logic
  touches styling/animation).
- `npx eslint .` — clean.
- `npx next build` — clean, all 71 routes generated.
- Live: verified each of the five dialogs (AI assistant, notifications,
  site search, a generic modal, a dropdown menu) still opens, animates,
  and closes identically under normal conditions, and confirmed via the
  browser's reduced-motion emulation that all five now skip the
  animation entirely under `prefers-reduced-motion: reduce`.

## Not changed

No component was rebuilt, no feature was removed, and no new dialog
abstraction was introduced. The fix is a pure styling consolidation plus
one new small, purpose-specific utility file.
