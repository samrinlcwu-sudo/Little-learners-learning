# Architecture

Status: technical foundation only. No homepage or product features are built
yet. This document records the decisions behind the foundation and the
intended shape of features not yet implemented.

## 1. Frontend architecture

Next.js 16 App Router with React Server Components by default; Client
Components only where interactivity is required (forms, games). Routes are
organized by audience/feature (public marketing, learning library, teacher
profiles, parent/child accounts) as route groups under `src/app/`, created as
each is actually built — not pre-scaffolded empty.

## 2. Backend architecture

No separate backend service. Next.js Route Handlers (`src/app/api/**/route.ts`)
and Server Actions cover backend needs (form submissions, data mutations),
backed by Supabase for persistence. This avoids running/maintaining a second
service for a product at this stage — revisit only if a real requirement
(e.g. heavy background processing) demands it.

## 3. Database strategy

Postgres via Supabase. Reasoning: relational data fits the domain (parents,
children, teachers, enrollments, resources with categories/tags) better than
a document store; Supabase bundles Postgres with Auth and Storage, avoiding
three separate vendors for a small team to operate. No project has been
provisioned yet — that is a deliberate decision point for whoever holds the
Supabase account, not something to spin up silently.

## 4. Authentication strategy

Supabase Auth (email/password + magic link to start; social providers can be
added later without a migration). Chosen over a standalone auth service
because it shares the same project/database and has first-class Next.js App
Router support via `@supabase/ssr` (client/server helpers already scaffolded
in `src/lib/supabase/`). Not wired to any UI yet — no login form exists.

## 5. API architecture

Route Handlers under `src/app/api/` for anything a client needs to call
directly (webhooks, third-party callbacks); Server Actions for form
submissions and mutations initiated from within a Server Component tree.
No API routes exist yet — none are needed until a real feature calls for one.

## 6. Content architecture

The learning-content model (`src/lib/content/types.ts`), category taxonomy
(`src/config/learning-categories.ts`), and per-category routes
(`/learn/[category]`) are documented in full in
[LEARNING_ARCHITECTURE.md](LEARNING_ARCHITECTURE.md). Religious/Qur'anic
content is gated by a `religiousReview` field enforced in code
(`isPubliclyVisible()`) — unverified content can never render on a public
route. Blog-style editorial content (not yet built) will follow the same
pattern under `src/content/` once it exists.

## 7. Asset management strategy

Static, build-time assets (icons, illustrations owned by the codebase) live
in `public/`. User- or content-generated assets (teacher photos, worksheet
PDFs, ebook files) will use Supabase Storage once accounts/content exist, so
they're access-controlled and don't bloat the repo. The official logo has not
been added to `public/` yet — see the warnings in the README.

## 8. State management strategy

None added. Server Components plus URL state (search params) and local
component state cover everything needed today. A client state library
(e.g. Zustand) is deferred until a specific feature — likely an interactive
game — genuinely needs shared client state that props/context can't handle
cleanly.

## 9. Form handling

React Hook Form for every form (uncontrolled by default, good performance,
integrates with Zod via `@hookform/resolvers`). No forms exist yet; the
pattern is established so the first real form (contact, admissions) follows
one convention instead of each feature inventing its own.

## 10. Validation

Zod schemas, shared where reusable (`src/lib/validations/common.ts` — email,
name, phone primitives) and colocated with a feature when specific to it.
Validated both client-side (via React Hook Form resolvers) and server-side
(re-validate on the server action/route handler — never trust client
validation alone).

## 11. Error handling

Next.js App Router conventions: `error.tsx` for route-segment error
boundaries, `not-found.tsx` for 404s, both implemented at the root now.
Server-side errors should be caught and logged (see Analytics-ready
architecture below for where a monitoring provider like Sentry would plug in
— not connected yet).

## 12. Security foundation

- Security headers set in `next.config.ts` (X-Content-Type-Options,
  X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Secrets only via environment variables (`.env.local`, never committed —
  enforced by `.gitignore`); `.env.example` documents required variables
  without real values.
- Supabase Row Level Security will gate all data access once tables exist —
  no table should ship without RLS policies.
- Service role keys (full database bypass) are server-only and must never
  carry the `NEXT_PUBLIC_` prefix.

## 13. SEO foundation

Next.js Metadata API (`metadata` export, `metadataBase`) for per-page titles
and descriptions; `src/app/sitemap.ts` and `src/app/robots.ts` implemented
and will grow as real routes are added. AEO (answer-engine optimization) will
follow from the same structured content model in item 6 — clean semantic
markup and factual, well-structured copy rather than a separate system.

## 14. Accessibility foundation

`eslint-plugin-jsx-a11y` (recommended rules) enforced in the ESLint config.
Semantic HTML and keyboard/focus handling are a requirement for every future
component, particularly given the child/parent/teacher audience — not
optional polish.

## 15. Analytics-ready architecture

No analytics provider is connected yet. When one is added (e.g. Vercel
Analytics or GA4), it should be gated behind an environment variable and
loaded from the root layout only, so it can be toggled per environment
without a code change.

## 16. Future AI integration architecture (not connected)

Planned as a Route Handler (`src/app/api/ai/**`) calling the Anthropic API
server-side only — the API key must never reach the client. No AI provider
is wired up; this is a placement decision, not an implementation.

## 17. Future WhatsApp integration architecture (not connected)

Planned as a webhook Route Handler receiving WhatsApp Business API events,
authenticated via a verify token, forwarding into the same
Route-Handler/Server-Action layer used elsewhere rather than a bespoke path.
Not connected.

## 18. Future payment architecture (not connected)

Planned around Stripe (Checkout/Billing) given Next.js/Supabase have mature,
well-documented integrations with it; webhooks would land in
`src/app/api/webhooks/stripe/route.ts`. No payment provider is connected, and
none should be until a real commercial transaction flow is being built.

The catalog this would eventually sell — `Offering`
(`src/lib/offerings/types.ts`, Prompt 59, `docs/BUSINESS_ARCHITECTURE.md`)
— is modeled and ready, with zero live instances today.

## 19. Future mobile application compatibility

Business logic (validation schemas, Supabase queries) is kept in framework-
agnostic modules under `src/lib/` rather than inside React components, so it
can be shared with a future React Native/Expo app. A monorepo split
(`apps/web`, `apps/mobile`, `packages/shared`) is deferred until a mobile app
is actually being built — introducing it now would be premature structure
for a single Next.js app.
