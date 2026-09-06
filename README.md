# Little Learners Learning

A commercial early-years EdTech platform. This is an independent codebase — it
does not reuse, merge, or derive from any prior "Little Learners" project.

## Project purpose

Little Learners Learning is being built as a scalable educational platform for
young children and their families/teachers, eventually spanning a public
website, a learning resource library (worksheets, activities, ebooks, games),
parent and child accounts, teacher profiles, admissions workflows, and more.
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture and
roadmap. This repository currently contains the technical foundation only —
no homepage or product features have been built yet.

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
  app/                 Next.js App Router — routes, layouts, metadata files
                          style-guide/  internal design-system reference page
  components/
    ui/                  Design-system primitives (Button, Card, Modal, ...)
    layout/                Site chrome (SiteHeader, SiteFooter)
  config/               Site-wide constants (name, URL, etc.)
  lib/
    supabase/            Supabase client factories (browser + server)
    validations/          Shared Zod schemas
    utils/                 Shared utilities (colocated with their tests)
public/
  brand/                    Official logo (used unmodified)
docs/                       Architecture and design-system decision records
```

Feature areas listed in the architecture doc (learning content, teacher
profiles, parent/child accounts, admin, AI assistant, etc.) are deliberately
**not** scaffolded as empty folders yet — each is created when its first real
file is added, to avoid empty-directory clutter.

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
