# Little Learners Learning

A commercial early-years EdTech platform. This is an independent codebase — it
does not reuse, merge, or derive from any prior "Little Learners" project.

## Project purpose

Little Learners Learning is an early-years learning platform for young
children and the parents/teachers guiding them. The public site — homepage,
Learning Hub, Resource Library, Games Hub, About, Parents, Teachers, Support,
FAQ — is live and functional today, on real (if still-small) sample content.
Accounts, progress tracking, teacher registration, downloads, and payments
are the next layer, deliberately not faked in the meantime — see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full roadmap.

## Technology stack

- **Next.js 16 (App Router) + TypeScript** — unified framework for the public
  site, SEO-critical pages, and the eventual app surface (accounts,
  dashboards), without a separate frontend/backend split.
- **Tailwind CSS v4** — utility-first styling for a consistent, maintainable
  design system as the product grows.
- **Supabase (Postgres + Auth + Storage)** — planned database, authentication,
  and file storage provider. Not yet provisioned — see
  [Environment configuration](#environment-configuration).
- **Zod + React Hook Form** — shared validation and form-handling pattern for
  every future form (contact, admissions, teacher registration, etc.).
- **Vitest** — unit testing, colocated with source files (`*.test.ts`).
- **ESLint** (flat config) with `eslint-plugin-jsx-a11y` — linting and
  accessibility checks.
- **Radix UI primitives** (Dialog, Tabs, Dropdown Menu) — correct focus
  trapping, keyboard navigation, and ARIA for the interactive components the
  brief requires, instead of hand-rolled accessibility logic.
- **class-variance-authority** — typed variant styling for Button/Badge/Alert,
  one source of truth per component instead of ad hoc conditional classes.
- **lucide-react** — the icon set used across alerts, buttons, and states.

Full rationale for each choice is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
Visual design system (colors, typography, components) is documented in
[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) and rendered live at `/style-guide`.
The subject/content model (categories, age ranges, content types, search and
Qur'an-content safeguards) is documented in
[docs/LEARNING_ARCHITECTURE.md](docs/LEARNING_ARCHITECTURE.md). The resource
library (worksheets/activities/ebooks/teacher & parent resources, access
tiers, downloads) is documented in
[docs/RESOURCE_LIBRARY_ARCHITECTURE.md](docs/RESOURCE_LIBRARY_ARCHITECTURE.md).
The Games Hub (game data model, the reusable choice-game engine, child
safety) is documented in
[docs/GAMES_HUB_ARCHITECTURE.md](docs/GAMES_HUB_ARCHITECTURE.md). Accounts
and authentication (roles, the planned schema, what's real today versus
prepared for later) are documented in
[docs/ACCOUNTS_ARCHITECTURE.md](docs/ACCOUNTS_ARCHITECTURE.md). Learning
progress tracking (what's recorded, why some activity types are
deliberately never tracked, and the parent/child views) is documented in
[docs/PROGRESS_ARCHITECTURE.md](docs/PROGRESS_ARCHITECTURE.md).

## Installation

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with real values when they're available (see below). Do
not commit `.env.local`.

## Development commands

```bash
npm run dev         # start the dev server (Turbopack, default in Next.js 16)
npm run build        # production build
npm run start          # run the production build locally
npm run lint             # ESLint
npm run typecheck         # TypeScript, no emit
npm run test                # Vitest unit tests
```

## Environment configuration

Copy `.env.example` to `.env.local` and fill in real values:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL, used for SEO metadata, sitemap, robots.txt |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (safe for the browser) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key (safe for the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **server-only, never expose to the client** |

No Supabase project has been provisioned yet. These are placeholders until
that decision is executed.

## Project structure

```
src/
  app/                       Next.js App Router — one folder per route
    page.tsx                   Homepage (/)
    learn/page.tsx              Learning Hub (/learn)
    learn/[category]/page.tsx    One subject's page (/learn/mathematics, ...)
    resources/page.tsx          Resource Library (/resources)
    resources/[resource]/page.tsx  One resource's detail page
    games/page.tsx               Games Hub (/games)
    games/[game]/page.tsx         One game's page (loads the actual game)
    parents/, teachers/,         Audience landing pages
    about/, support/, faq/,      Informational pages
    privacy/, terms/
    style-guide/page.tsx         Internal design-system reference (not public nav)
    globals.css                  Design tokens: colors, fonts, radius, shadows
    not-found.tsx, error.tsx     Friendly 404 / error screens
  components/
    ui/                        Design-system primitives — Button, Card, Badge,
                                  Input, Modal, Accordion, Heading, Section, ...
    patterns/                  Compositions built from ui/ for one purpose —
                                  ResourceCard, GameCard, PageHeader, SiteSearch, ...
    layout/                    Site chrome — SiteHeader, SiteFooter
  config/                     Small, hand-written site data — nav links,
                                the 16 subject/learning categories, site name/URL
  lib/
    content/, resources/,      Sample data + types for lessons, resources, and
    games/                       games (see "Adding content" below)
    search/                    The site search index, built from the above
    supabase/                  Supabase client factories (browser + server)
    validations/                Shared Zod schemas
    utils/                       Shared utilities (colocated with their tests)
public/
  brand/                      Official logo (used unmodified)
docs/                         Deeper architecture notes for each subsystem
```

## Common tasks (for anyone new to this codebase)

**Add a new page.** Create `src/app/my-page/page.tsx`. Copy the shape of an
existing simple page (`src/app/about/page.tsx` is a good example) — wrap
content in `<Section>` and `<Container>`, use `<Heading level="h1">` for the
title, and `<PageHeader>` (`src/components/patterns/page-header.tsx`) if the
page needs a breadcrumb + title band like the hub pages do. Next.js turns the
folder name into the URL automatically — no routing config to touch. If the
page should appear in the header or footer, add it to
`src/config/nav.ts`.

**Add a new learning resource, game, or lesson.** These aren't in a database
yet — each one is an object in a plain array:

- Resources (worksheets, ebooks, activities): `src/lib/resources/sample-resources.ts`
- Games: `src/lib/games/sample-games.ts`
- Lessons/learning content: `src/lib/content/sample-content.ts`

Copy an existing entry's shape (see the `Resource`/`Game`/`LearningContent`
types in the matching `types.ts` file for what every field means), fill it
in, and set `publicationStatus: "published"`. It appears on the site
immediately — no other file needs to change. A resource only shows a working
download button once it has a real `downloadFile`; a game only becomes
playable once it also has a real component wired into
`src/components/games/game-player.tsx` — everything else honestly shows
"Coming soon" rather than a broken link.

**Change a color, font, spacing, or shadow.** All of it lives in one file:
`src/app/globals.css`, inside the `:root` and `@theme inline` blocks. Change
a value there and it updates everywhere that token is used — nothing is
hardcoded per-component. The full palette and type scale are also visible
live at `/style-guide`.

**Run the project locally** — see [Development commands](#development-commands)
below. **Run automated checks before committing:** `npm run typecheck && npm run lint && npm run test`.

## Development principles

- No fake functionality: unimplemented features are documented, not
  simulated with placeholder UI or mock APIs.
- No feature is added because it's popular — every dependency has a stated
  reason in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Secrets are never hardcoded; all configuration flows through environment
  variables documented in `.env.example`.
- Religious/Quranic content (when built) requires human verification before
  publishing — never generated or altered automatically.

## Important warnings

- This project is intentionally independent from any earlier "Little
  Learners" website or codebase. Do not merge or copy from prior projects
  into this one without explicit instruction.
- The official brand logo (`public/brand/little-learners-learning-logo.png`)
  must never be redesigned, recolored, distorted, or replaced without
  explicit approval — treat it as immutable.
- AI assistant, WhatsApp integration, and payment processing are **not**
  connected. Their planned architecture is documented but no credentials or
  SDKs are wired up.
