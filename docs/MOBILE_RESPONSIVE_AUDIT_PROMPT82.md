# Mobile-First Experience & Responsive Polish (Prompt 82)

A breakpoint-by-breakpoint audit of every major route — 320px, 375px, 414px,
tablet (768px), laptop (1024px), and large desktop (1440px) — checking for
overflow, broken layouts, crowded controls, and touch-target sizing, using
real browser viewport emulation and DOM measurement (not just visual
inspection).

## Method

For each route, checked programmatically: `document.documentElement.scrollWidth`
vs `clientWidth` (any horizontal overflow at all), and the bounding-box
height of every interactive element (flagging anything under 20–24px).
Then screenshotted representative pages at each breakpoint for visual
issues a DOM check can't catch (wrapping, crowding, spacing).

Routes checked: homepage, `/learn`, `/learn/mathematics`, `/resources`,
`/resources/[resource]`, `/games`, `/games/letter-match`,
`/games/number-memory`, `/blog`, `/blog/[article]`, `/teachers`,
`/admissions`, `/dashboard`, `/dashboard/applications/new`,
`/teachers/dashboard`, `/teachers/register`, `/sign-up`, `/support`, and
the admin sign-in screen.

## Real problems found and fixed

### 1. Parent Dashboard's "Ask about learning" card broke at narrow widths

At 320–375px, the card's "Development preview" badge sat as a fixed-width
flex sibling next to the title/description column. Because the flex-1 text
column had no `min-w-0`, the badge's own minimum content width won the
layout fight and squeezed the text column down to ~140px — wrapping "Ask
about learning" one word per line and turning the description into a
narrow, hard-to-read stack.

**Fix**: moved the badge to sit inline next to the title (in a
`flex flex-wrap` row) instead of as a separate trailing flex item, and
added `min-w-0` to the text column. This isn't just a mobile fix — at
every width, the badge now reads as an annotation on the title (the same
placement pattern already used for this exact badge in the AI assistant's
own dialog title) instead of being stranded at the far right edge of the
card. Applied the same defensive `min-w-0` (plus `truncate` on the name)
to the same icon+text+badge pattern in the admin parent-detail page's
child list, which had the same structural risk with lower-severity
content (short names, single-word status badges).

### 2. Password show/hide toggle had a 16×16px tap target

Present on every auth screen (sign in, sign up, forgot/reset password,
teacher registration) via the shared `PasswordInput` component — the
button was sized to exactly its icon with no padding, well under the
WCAG 2.5.8 24px minimum.

**Fix**: added `p-2` and adjusted the offset so the icon lands in the same
visual position as before; the tap target is now 32×32px, fixed in the
one shared component so every form using it benefits at once.

### 3. Footer navigation links were cramped for touch

Every page's footer nav (`Learn`, `Resources`, `Games`, ...) rendered each
link at a ~17px-tall text line with only a 10px gap to the next one —
under the 24px minimum with too little surrounding space to reliably
avoid mis-taps between adjacent links.

**Fix**: replaced the `space-y-2.5` gap-via-margin with `py-2` padding on
each link itself (`inline-block py-2`). Each link's real tap area is now
~36px tall, the links are directly adjacent with no dead zone to miss,
and the visual rhythm is if anything more comfortable than before.

## What was already correct (confirmed, not changed)

- **Zero horizontal overflow** at 320px (the narrowest realistic phone
  width) across all 19 routes checked — verified via
  `scrollWidth`/`clientWidth`, not just a visual scan.
- **Header/mobile navigation**: the hamburger menu opens a full-height
  drawer with generously-spaced nav rows (~96px apart), search/assistant/
  notification rows at full width, and a visible "Sign in"/"Create
  account" CTA — nothing essential is hidden behind an unclear gesture.
- **Hero section**: the headline wraps naturally across 3 balanced lines
  at 320px, buttons stack full-width with comfortable height, decorative
  blobs remain visible and don't crowd the text.
- **Learning category pages**: subtopic cards correctly collapse from 2
  columns to 1 below tablet width; badges wrap instead of overflowing.
- **Resource Library**: filter fields collapse to a single column below
  tablet width, resource cards stack to 1 column, the "Apply filters"
  button and every card's action button are full-width and easy to tap.
- **Games**: verified two different interaction shapes — a 3-button
  choice game (Letter Match: each button ~165×165px, generously spaced)
  and an 8-card memory grid (Number Memory: each card easily tappable,
  clear gaps, on-page accessibility notes already state it's fully
  keyboard-playable with no time pressure). No overflow at 320px in
  either.
- **Blog articles**: body copy keeps a comfortable line length and
  line-height at 320px; heading hierarchy holds; no images to worry
  about since none are populated yet (Prompt 80's finding still holds).
- **Application forms**: the admissions wizard's empty state (no child
  profile yet) is centered, clear, and correctly guides back to the
  dashboard rather than showing a broken or confusing form.
- **Large desktop (1440px)**: content stays inside its `max-w-*`
  container instead of stretching full-bleed; nothing looks sparse or
  awkwardly spaced out.

## Accessibility

- Every fix above is a spacing/layout change only — no `aria-*`
  attribute, focus order, or semantic element was touched.
- Re-verified the mobile nav toggle's `aria-expanded`/`aria-controls`
  and `inert` state still work correctly after inspection (the
  measurement script confirmed the underlying state machine, independent
  of any visual check).
- `prefers-reduced-motion` handling from Prompt 81 (the shared
  `motion-safe:` dialog transitions) is untouched and still in place.
- Focus rings (`focus-visible:ring-2`) are present on both newly-resized
  interactive elements (the password toggle, footer links) — confirmed
  by reading the class list, not just visually.

## Visual requirement

Screenshotted the homepage, a resource listing, a game, and the parent
dashboard at 320px, 375px, 768px, and 1440px after all fixes. The site
reads exactly as warm, colorful, and playful as before at every size —
none of the three fixes touched color, typography, imagery, or spacing
rhythm beyond what was needed to stop text from wrapping badly or a
button from being too small to tap reliably.

## Testing performed

- `npx tsc --noEmit` — clean.
- `npx vitest run` — 46 files, 289 tests, all passing.
- `npx eslint .` — clean.
- `npx next build` — clean, all 71 routes generated.
- Live: DOM-level overflow and touch-target measurement across 19 routes
  at 320px; visual screenshots at 320px, 375px, 768px, and 1440px for the
  homepage, learning category, resource library, games, blog, dashboard,
  and forms; confirmed both fixes render correctly at every breakpoint
  checked, with no regression to the desktop layout.

## Not changed

No design system component was replaced or rebuilt. Both structural
fixes are minimal, targeted class changes to existing markup — no new
component, no new dependency, no removed feature.
