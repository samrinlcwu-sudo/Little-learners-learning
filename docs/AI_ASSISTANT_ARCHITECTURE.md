# AI Assistant Architecture

Introduced in Prompt 46 as architecture and UI foundation only — no
external AI provider is connected. Read this before building the real
assistant on top of it; the goal is that connecting a provider later
changes exactly one function (`getAiAssistantProvider` below) and nothing
else.

## Why this exists before any AI is connected

Building the seams now — audience, permissions, session handling, the
service-layer interface — means the eventual real integration is a
provider swap, not a redesign under pressure. This is the same "prepared
architecture, not simulated" pattern already used for teacher moderation
(`docs/TEACHER_ARCHITECTURE.md`) and resource review: the real logic
exists and is tested today, even though nothing downstream can act on it
yet.

## The five layers

| Layer | File(s) | Job |
|---|---|---|
| AI UI | `src/components/patterns/ai-assistant.tsx` | The dialog itself — messages, input, suggested prompts, the "Development preview" badge and disclosure text |
| Audience / permissions | `src/lib/ai/audience.ts`, `use-ai-audience.ts`, `permissions.ts` | Who's asking, and what they may be helped with |
| Session handling | `src/lib/ai/use-ai-conversation.ts` | In-memory conversation state for one open dialog |
| Service layer | `src/lib/ai/types.ts` (`AiAssistantProvider`), `get-provider.ts` | The one seam a real provider plugs into |
| Guardrails | `src/lib/ai/guardrails.ts` | Safety rules a real integration must be built around, and the disclosure shown today |
| Knowledge/content | `src/lib/ai/knowledge/` (Prompt 47 — see `docs/AI_KNOWLEDGE_LAYER_ARCHITECTURE.md`) | Composes the existing subjects/resources/games/progress data into an AI-facing shape; invents nothing new |

Nothing here is a rebuild of an existing system. The "knowledge layer" row
is deliberately just a pointer to content that already exists — a real
assistant integration should retrieve from `getAllLearningCategories()`,
the resource/game libraries, etc., the same way `src/lib/search/index.ts`
already does, not duplicate them into a new AI-only dataset.

## Audience: who is actually asking

```ts
export type AiAudience = "public" | "parent" | "child" | "teacher" | "admin";
```

Deliberately distinct from `AccountRole` (`src/lib/accounts/types.ts`,
`"parent" | "teacher" | "admin"`) — "public" (no account) and "child" (a
profile a parent manages, never its own account — see that file's own
comment) are both real audiences the assistant must reason about even
though neither is an `AccountRole`.

`getAiAudience(pathname)` (`src/lib/ai/audience.ts`) derives the audience
from the current route — the same "derive, don't invent" rule that governs
every other honesty-sensitive part of this app. It never reads private
data to decide; the URL alone is enough:

| Route prefix | Audience |
|---|---|
| `/dashboard/children/*` | `child` |
| `/teachers/dashboard`, `/teachers/register*` | `teacher` |
| `/dashboard*`, `/account*` | `parent` |
| everything else (including `/teachers` and `/teachers/p/[slug]`, which are genuinely public) | `public` |

Unit-tested in `audience.test.ts`.

## Permissions: what each audience may be helped with

`AI_AUDIENCE_PERMISSIONS` (`src/lib/ai/permissions.ts`) maps every
audience to real, already-enforced boundaries — a parent's assistant
context can only ever be *their own* children, because
`src/lib/accounts/local-children.ts` never holds another family's data in
the first place; a teacher's context can only be *their own* profile and
resources, for the identical reason (`local-teacher.ts`,
`local-teacher-resources.ts` hold at most one teacher's data per browser).
Nothing here needs a runtime permission check today because the
architecture makes the alternative impossible, exactly like the rest of
this local-first system.

`mayAccessAssistant` is the one flag with a visible effect right now: it's
`false` for `child` and `admin`, which is why the entry point in the site
header never renders on the child's own learning page even though
`SiteHeader` mounts there like everywhere else. This is a deliberate
Prompt 46 decision, not an oversight — see "Why no child-facing entry
point yet" below.

## Session handling

`useAiConversation(audience)` keeps messages in React state only, for the
lifetime of one open dialog. No conversation is written to `localStorage`
or anywhere else. Two reasons:

1. There's no backend to store it safely server-side, and a full chat
   transcript is a different kind of data than the small, deliberate
   profile fields this app already persists locally (a child's chosen
   name, a teacher's bio) — a family or teacher didn't affirmatively
   choose to save "everything I ever asked the assistant."
2. Changing audience — leaving the page the conversation belonged to —
   starts a fresh session rather than carrying a parent's question into a
   teacher context or vice versa, reinforcing the same boundary
   permissions already describe.

## Service layer: the one seam for a real provider

```ts
export interface AiAssistantProvider {
  readonly id: string;
  readonly isDevelopmentPlaceholder: boolean;
  respond(request: AiAssistantRequest): Promise<AiMessage>;
}
```

`getAiAssistantProvider()` (`get-provider.ts`) always returns
`devPlaceholderProvider` today — a fixed, audience-labeled reply that
never varies with what was actually typed, specifically so it can never be
mistaken for a real answer (see "No fake AI responses" below).

**When a real provider is connected, it must not be called from this
client-bundled module.** An API key can never reach the browser bundle —
the call has to move to a Next.js Route Handler (a new `src/app/api/...`
route; none exist yet in this codebase, since nothing has needed one
before now) that reads the key from a server-only environment variable and
returns just the reply. `getAiAssistantProvider` would then return a
provider whose `respond()` calls that route via `fetch`, keeping every
caller (`use-ai-conversation.ts`, and the UI above it) unchanged.

## No fake AI responses

The placeholder's replies are static strings keyed only by audience, never
built from the user's message — an input-aware-sounding placeholder would
risk being read as a working AI system, which is exactly what Prompt 46
says not to create. Every reply plainly says "development placeholder,"
and the dialog shows a permanent "Development preview" badge plus the
disclosure text from `AI_DISCLOSURE_TEXT` for as long as
`isDevelopmentPlaceholder` is `true`.

## Safety

`AI_SAFETY_GUIDELINES` (`guardrails.ts`) is a plain list a real provider
integration must be built around — a system-prompt input and a review
checklist once one exists, not enforced by any code today because there's
no real provider yet to constrain. It covers the brief's specific
requirements directly: never collect a child's identifying details, never
cross a family/teacher boundary, never claim to be human, never give
unsafe/medical/legal/crisis instructions, and — specifically for Qur'an
and Nazra content — never invent religious text; only ever reference
human-verified source material, the same rule
`docs/TAXONOMY_ARCHITECTURE.md` and the games/resources content already
follow for religious material.

## Why no child-facing entry point yet

The brief asks the architecture to *understand* a child audience, not that
every audience gets a live chat button in this prompt. Exposing an
open-ended text box to a young child needs stronger guardrails than a
placeholder architecture can promise — real content filtering, a real
provider with real safety tuning, and likely parental controls, none of
which exist yet. `AI_AUDIENCE_PERMISSIONS.child.mayAccessAssistant` is
`false` so this is enforced as real, tested data
(`src/lib/ai/permissions.ts`) rather than a comment promising future
carefulness. The type system already knows about `"child"` as an audience,
the same way `AccountRole` already carries `"admin"` before any admin UI
exists — ready to turn on once the guardrails are real, not before.

## Entry point placement

One shared `AiAssistant` / `AiAssistantTrigger` pair
(`src/components/patterns/ai-assistant.tsx`), originally mounted in
`SiteHeader` alongside `SiteSearch` / `SiteSearchTrigger` (`site-search.tsx`)
so it read as a built-in platform utility from day one, not a bolted-on
widget on a single screen.

**Updated in Prompt 48:** `<AiAssistant>` now wraps the whole page body in
`src/app/layout.tsx`, not just `SiteHeader`, so entry points can live
anywhere — the header's icon, and (from Prompt 48 onward) a card on the
Parent Dashboard and an item in the Teacher Dashboard's Quick Actions
grid, all opening the exact same dialog. This also means
`AiAssistantTrigger` is deliberately **not** `DialogPrimitive.Trigger`
(unlike `SiteSearchTrigger`, which still is) — see
`docs/AI_PARENT_ASSISTANT_ARCHITECTURE.md`, "What changed," for the real
bug that caused (nesting two Radix `Dialog.Root`s let the innermost one
hijack the outer one's trigger) and the fix (a plain React context,
`AiAssistantOpenContext`, independent of Radix's own Dialog context).
`mayAccessAssistant` still keeps the assistant out of the one context (a
child's own learning page) where it shouldn't appear, regardless of where
a trigger is placed.

## SEO/AEO

The assistant has no route of its own — it's a dialog mounted in the
global header, the same as search. Nothing about it is indexable or
non-indexable in a way that needs a metadata change, and no existing
metadata, structured data, sitemap entry, or robots rule was touched.
Conversation content lives only in React state for the current tab and is
never rendered into the page's initial HTML, so there's nothing here for a
crawler to see either way. All previously shipped SEO/AEO work
(`docs/SEO_ARCHITECTURE.md`) is unchanged.
