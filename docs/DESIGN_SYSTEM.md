# Design System

Live reference: `/style-guide` (internal route, not indexed, not linked from
navigation). Run `npm run dev` and open it to see every token and component
rendered together.

## Brand

The official logo lives at `public/brand/little-learners-learning-logo.png`,
used unmodified — no recoloring, cropping, or redrawing. It is intentionally
colorful and illustrative, which sits in tension with the "premium, not
generic-kindergarten" brief. The resolution: the logo is used as a contained
brand mark (header, footer) rather than a dominant graphic, and the
surrounding system — typography, spacing, restrained color, soft shadows —
carries the premium/professional feel. The logo also has a flat cream
background baked into the file (no transparency), which is why the page
background (`--color-surface-sunken`) is a matching cream rather than pure
white.

Known limitation: at small header/footer sizes (32–40px) the logo's detail
reads as a colorful mark rather than legible text. That's inherent to the
source file, not something fixed by editing it here — a simplified
"lockup" variant (icon-only, or icon + typeset wordmark) would need to be
supplied separately if a crisper small-format mark is wanted later.

## Color system

Seven families, each with the shades actually used (not a full 50–900 ramp
everywhere — only what a real UI needs):

| Family | Role |
|---|---|
| Primary (deep teal) | Main interactive color — buttons, links, focus ring |
| Secondary (terracotta) | Secondary actions, warm accents |
| Accent (gold) | Small highlights/badges only — never a base surface |
| Neutral (warm gray, cream-tinted) | Text, borders, surfaces |
| Success / Warning / Error | Semantic feedback, each pairs a color with an icon |

Deliberately excluded: a rainbow of hues. Every accent color is muted/darkened
from the logo's brighter tones specifically to read as credible rather than
"kids' clip-art." All text/background pairings used in components were
checked against WCAG AA (4.5:1 for normal text) — see inline comments in
`globals.css` for the specific pairs.

## Typography

- **Fraunces** (serif, variable) for headings and display text — adds warmth
  and editorial credibility without looking childish.
- **Inter** (sans) for all body copy and UI text — chosen for legibility at
  small sizes in forms and dense UI.
- Scale: `display / h1 / h2 / h3 / h4 / h5`, implemented via the `<Heading>`
  component. Visual size (`level`) is decoupled from the semantic element
  (`as`) so document outline stays correct even when the visual scale
  doesn't match it 1:1.

## Spacing, radius, shadows

- Spacing uses Tailwind's default 4px-based scale — no custom scale invented.
- Radius tokens (`--radius-sm/md/lg/xl`) are friendly but restrained (8–20px),
  not pill-shaped by default.
- Shadows are soft and warm-tinted (ink-based rgba, not pure black) at three
  elevations (`shadow-sm/md/lg`).

## Component inventory

All in `src/components/ui/` (one file per component, no barrel export —
import directly, matching the shadcn/ui convention this system follows):

`button`, `input`, `textarea`, `select`, `label`, `card`, `badge`, `alert`,
`modal` (Radix Dialog), `tabs` (Radix Tabs), `dropdown-menu` (Radix Dropdown),
`breadcrumb`, `container`, `section`, `heading`, `loading` (Spinner +
Skeleton), `empty-state` (empty/error variants — one component, not two, per
"don't duplicate"), `decorative-blob` (restrained illustrative accent).

Layout chrome lives in `src/components/layout/`: `site-header`, `site-footer`.
`SiteHeader` renders nav links only when a real `links` prop is passed — an
empty nav with a mobile-menu toggle would be a broken affordance, so today's
deployed header shows just the brand mark until real destinations exist.

## Accessibility

- Every interactive element has a visible `:focus-visible` ring
  (`globals.css`), never suppressed.
- Alerts, empty/error states, and badges pair color with an icon or label —
  never color alone.
- Modal, Tabs, and Dropdown use Radix UI primitives for correct focus
  trapping, keyboard navigation, and ARIA roles rather than hand-rolled
  behavior.
- `eslint-plugin-jsx-a11y` (recommended rules) runs in CI-equivalent local
  linting; the two rules that don't apply to generic wrapper components
  (`CardTitle`, `Label`) are suppressed with an inline comment explaining why,
  not disabled project-wide.

## Responsive strategy

No separate mobile/desktop designs — one set of components with responsive
Tailwind variants (`sm: md: lg:`), validated at mobile (375px), tablet
(768px), and desktop widths on the `/style-guide` page. `Container` and
`Section` are the two primitives every page composes from, so spacing and
max-width stay consistent instead of being redecided per page.
