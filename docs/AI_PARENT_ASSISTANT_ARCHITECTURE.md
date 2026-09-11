# Parent AI Assistant Experience

Introduced in Prompt 48, on top of the AI architecture from Prompt 46
(`docs/AI_ASSISTANT_ARCHITECTURE.md`) and the knowledge layer from Prompt
47 (`docs/AI_KNOWLEDGE_LAYER_ARCHITECTURE.md`). This is UI/UX only — the
assistant still answers through the same development-placeholder provider
from Prompt 46. Nothing here connects a real AI, and no existing parent
dashboard behavior was rebuilt.

## What changed

1. **The assistant dialog can now be opened from more than one place.**
   `<AiAssistant>` moved from wrapping just `SiteHeader` to wrapping the
   whole page body in `src/app/layout.tsx` (header, main content, and
   footer), so any `AiAssistantTrigger` anywhere on the page — the header,
   the parent dashboard — opens the same shared dialog instance.

   This surfaced a real bug worth recording: `AiAssistantTrigger` was
   originally just `DialogPrimitive.Trigger` (Radix), matching
   `site-search.tsx`'s own pattern exactly. A Radix `Dialog.Trigger` binds
   to whichever `Dialog.Root` is *nearest* in the React tree, regardless of
   which `Root` variable it came from. Once `<AiAssistant>` wrapped
   `<SiteHeader>` (which itself wraps its content in `<SiteSearch>`'s own
   `Dialog.Root`), the search trigger sat inside *two* nested Dialog
   contexts — and the innermost one silently won for both triggers. In
   testing, clicking the assistant icon opened the search dialog instead.
   The fix: `AiAssistantTrigger` no longer uses Radix's `Dialog.Trigger` at
   all. It uses its own plain React context (`AiAssistantOpenContext` in
   `ai-assistant.tsx`) carrying nothing but an `openAssistant()` callback —
   entirely independent of Radix's internal Dialog context, so it can
   never collide with `SiteSearch` or any other Radix dialog no matter how
   they're nested. `Dialog.Root`/`Portal`/`Overlay`/`Content`/`Close` are
   still real Radix components for the actual modal (focus trap, ESC to
   close, ARIA) — only the trigger-to-root wiring changed.
2. **A visible entry point on the Parent Dashboard.** `parent-dashboard.tsx`
   gained one new card — "Ask about learning," styled like the existing
   quick-link cards below it, with a permanent "Development preview" badge
   so it's never mistaken for a live feature. This is the "simple entry
   point from the parent dashboard" the brief asks for; nothing else on
   the dashboard was touched.
3. **A richer parent-only home view inside the dialog.** Before this
   prompt, opening the assistant showed the same two-audience-agnostic
   suggested-question chips for every audience. For `parent` specifically,
   the empty state (before any message is sent) now also shows:
   - **Learning areas** — every real category from
     `src/config/learning-categories.ts`, as direct links to
     `/learn/[slug]`. Clicking one navigates and closes the dialog; it
     never goes through the chat/provider.
   - **Progress-related help** — one line per real child, built from
     `getChildProgressKnowledge` (Prompt 47): how many subjects that
     specific child has actually explored, and their real
     `getNextStepSuggestion` if one exists. A child with no events yet
     says so plainly ("no activity recorded yet") rather than showing
     nothing or a guess. A parent with no children yet sees one honest
     line pointing back at the dashboard — never a fabricated "your
     child's progress" claim.
   - **Browse resources / Browse games** — plain links to the existing
     library pages.

   All three sections are read-only navigation and real, already-computed
   data — none of it is sent to `sendMessage()` or the provider. A
   parent's suggested-question chips (now four, one per major use case:
   what's next, literacy resources, games, "how is my child doing") still
   go through the same honest development-placeholder reply as every
   other audience.

## Why this still isn't "real AI"

The provider is unchanged from Prompt 46 — `getAiAssistantProvider()`
still returns `devPlaceholderProvider`, which replies with the same fixed,
audience-labeled sentence no matter what's typed. The "Development
preview" badge appears on both the dialog and the new dashboard entry
card. Nothing about this prompt makes the interface answer real questions
— it makes the *non-chat* part of the interface (the parts that don't
require a real AI: real navigation, real already-computed progress)
noticeably more useful today, while being explicit that the open-ended
"ask a question" part is still a placeholder.

## Privacy

- `ParentHomeSections` (in `ai-assistant.tsx`) reads `useChildProfiles()`
  and `useProgressEvents()` — the same hooks the Parent Dashboard itself
  already uses. Because a browser only ever holds one family's children
  (`src/lib/accounts/local-children.ts`), there is no "another family's
  child" this could ever show, the same guarantee every other
  child-facing view in this app already relies on.
- Nothing computed here (child names, subject counts, next-step labels) is
  passed into `sendMessage()` or the provider — it's rendered directly as
  static UI. Since the provider is the local placeholder, no external
  service is called at all, so there's nothing to leak regardless; this
  prompt explicitly asks that no such data reach an external provider,
  which is trivially true while none is connected.
- The dialog itself gates on `AI_AUDIENCE_PERMISSIONS[audience].mayAccessAssistant`
  exactly as it did in Prompt 46 — unchanged, still `false` for `child`
  and `admin`.

## SEO

No route changed. The assistant is still a dialog with no URL of its own,
mounted in the shared layout — the same reasoning as Prompt 46's SEO
section. `/dashboard` was already `robots: { index: false, follow: false }`
before this prompt and still is.

## Testing notes

Verified live: the full parent journey (dashboard → open assistant from
the new card → see real learning-area links and real per-child progress
lines → navigate to a subject page → dialog closes) end to end, with two
seeded children to confirm each child's line reflects only their own
events, and with zero children to confirm the honest empty state.
Explicitly re-verified, after the trigger-context fix above, that clicking
the header's search icon still opens search (not the assistant) and the
header's assistant icon still opens the assistant (not search) — the exact
regression the fix addresses. Also checked on mobile and tablet viewport
sizes, and confirmed the assistant trigger stays entirely absent on the
child's own learning page and that the teacher dashboard's own assistant
copy is unaffected.
