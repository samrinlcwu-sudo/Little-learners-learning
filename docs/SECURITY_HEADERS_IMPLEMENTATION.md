# Security Headers Implementation

The final production security-header pass, and the Content Security
Policy this project deliberately didn't add earlier
(`docs/SECURITY_FINAL_CHECK.md` and `docs/PRODUCTION_SETUP.md` both
flagged CSP as a real, recommended next step rather than rushing it).
Every claim below was verified directly — the CSP was built from a
real, direct search of this codebase's actual scripts, styles, images,
and API calls, not a generic template.

## Headers Implemented

All set in `next.config.ts`'s `headers()` function, applied to every
route (`source: "/:path*"`) — the same mechanism this project has used
since Prompt 98, extended rather than replaced:

| Header | Value | Status |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Already present (Prompt 98) |
| `X-Frame-Options` | `DENY` | Already present (Prompt 98) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Already present (Prompt 98) |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Already present (Prompt 98) |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Already present (Prompt 98) |
| `Content-Security-Policy` | see below | **New — Prompt 113** |
| `X-Powered-By` | (removed) | Already removed via `poweredByHeader: false` (Prompt 98) |

Frame protection uses both the classic `X-Frame-Options: DENY` (kept,
for older browser compatibility) and the modern CSP equivalent,
`frame-ancestors 'none'` — the two are consistent with each other, not
contradictory, and modern browsers prefer the CSP directive when both
are present.

## CSP Directives Used

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self' <the real, configured Supabase project URL>;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-src 'none';
frame-ancestors 'none';
upgrade-insecure-requests;
```

(`'unsafe-eval'` is additionally appended to `script-src` only when
`NODE_ENV === "development"` — required for React's own dev-mode error
reconstruction, per Next.js's own documentation; never present in a
production build.)

### Why each directive is needed

- **`default-src 'self'`** — the safe fallback for every resource type
  not explicitly listed below (fonts loaded via `next/font`, Next.js's
  own runtime chunks, the manifest, workers). Nothing on this site
  needs anything beyond its own origin by default.
- **`script-src 'self' 'unsafe-inline'`** — `'self'` covers every real
  JS bundle Next.js serves. `'unsafe-inline'` is required because this
  app genuinely renders inline `<script>` elements: every JSON-LD
  structured-data block on the site
  (`src/lib/seo/json-ld.ts`'s `toJsonLdHtml()`, used via
  `dangerouslySetInnerHTML` in roughly 16 files — the homepage,
  learning category pages, resource/game/blog/offering detail pages,
  the FAQ page, breadcrumbs, and the teacher directory/public profile).
  Browsers apply `script-src` to **every** `<script>` element
  regardless of its `type` attribute — including
  `type="application/ld+json"`, which can never execute as JavaScript
  in the first place. This was verified directly (a repo-wide search
  for `dangerouslySetInnerHTML` found zero non-JSON-LD uses) before
  deciding this was the smallest necessary allowance, not assumed.
- **`style-src 'self' 'unsafe-inline'`** — required for the same
  reason on the style side: three real, dynamic inline `style={{}}`
  props exist (`src/app/page.tsx`'s hero animation delays,
  `color-match-game.tsx`'s dynamically-chosen color swatch,
  `teacher-dashboard.tsx`'s profile-completion progress bar width) —
  each computed per-render from real data, not expressible as a static
  Tailwind class.
- **`img-src 'self' data:`** — `'self'` covers every static image in
  `public/` and every `next/image`-optimized image (served from
  `/_next/image`, same origin). `data:` is required because a
  teacher's profile photo is stored and rendered as a base64 data URL
  (`<img src={photo}>` in four real components — the admin teacher
  detail view, the teacher directory card, the profile editor's own
  preview, and the public profile page) — verified by direct search,
  not assumed. No external image domain is allowed because none is
  used anywhere (`next.config.ts` has no `images.remotePatterns`).
- **`font-src 'self'`** — `next/font/google` (Fraunces, Inter)
  downloads and self-hosts font files at build time; the browser never
  makes a request to Google's font servers at runtime, so no external
  font domain needs to be allowed.
- **`connect-src 'self' <Supabase URL>`** — every real account
  operation (sign-up, sign-in, sign-out, reading/writing child
  profiles, teacher profiles, and applications) is a `fetch()` call
  from `@supabase/ssr` straight to the configured Supabase project's
  REST/Auth API. Without this, CSP would silently block every one of
  those calls — verified live this pass (see "Testing Performed").
  The URL is read from `process.env.NEXT_PUBLIC_SUPABASE_URL`, the
  same environment variable every other Supabase reference in this
  codebase already uses, never hardcoded to one specific project.
- **`object-src 'none'`** — no `<object>`, `<embed>`, or plugin content
  exists anywhere on this site.
- **`base-uri 'self'`** — prevents a `<base>` tag injection from
  redirecting relative URLs elsewhere; this site never sets its own
  `<base>` tag, so restricting it to `'self'` costs nothing.
- **`form-action 'self'`** — every real form on this site (admin login,
  sign-up/sign-in, teacher registration, the application wizard) submits
  to a Server Action or client-side handler on this same origin; none
  posts to an external URL.
- **`frame-src 'none'` / `frame-ancestors 'none'`** — verified this
  pass that zero `<iframe>` elements exist anywhere in the codebase
  (`grep -rl "<iframe"` returns nothing), and this site should never be
  framed by anything else either (matching the existing
  `X-Frame-Options: DENY`).
- **`upgrade-insecure-requests`** — a defense-in-depth instruction for
  browsers to upgrade any accidental `http:` sub-resource reference to
  `https:` in production; harmless on a plain-HTTP local server.

## Why Nonces Were Not Used

Next.js's own documentation
(`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`)
presents two production-safe CSP implementations: a nonce-based one
(the stricter option, avoiding `'unsafe-inline'` entirely) and a
static one set directly in `next.config.ts` (which the docs' own
example uses `'unsafe-inline'` for, exactly as this implementation
does). The nonce approach was deliberately **not** used here, for a
reason the documentation itself states plainly:

> "When you use nonces in your CSP, all pages must be dynamically
> rendered... Static optimization and Incremental Static Regeneration
> are disabled... Higher hosting costs."

This project's architecture leans heavily on static generation — the
last production build prerendered 71+ routes (every learning category,
every published resource/game/blog article, every static marketing
page) as static HTML. Switching all of them to dynamic, per-request
rendering just to remove `'unsafe-inline'` from two directives would
be a fundamental, sitewide performance and hosting-cost regression —
precisely the kind of unnecessary rebuild this prompt's own
instructions rule out ("Do NOT rebuild the project... Preserve all
existing working functionality"). The static approach was the
framework's own recommended path for a site in this exact position.

## Third-Party Domains Explicitly Allowed

Exactly one, and only in `connect-src`: the project's own configured
Supabase URL (`NEXT_PUBLIC_SUPABASE_URL`). No other third-party domain
appears anywhere in the CSP, because none is actually used:

- No analytics or advertising script is active (`src/lib/analytics/track.ts`
  is a genuine no-op until a provider is deliberately configured — see
  `docs/SEARCH_MONITORING_PLAN.md`).
- No payment processor is connected.
- No embedded third-party widget, video player, or map exists anywhere.
- No CDN-hosted script or stylesheet is loaded from anywhere other than
  this site's own origin.

## Limitations and Deployment-Specific Considerations

- **`'unsafe-inline'` remains for `script-src` and `style-src`.** This
  is a real, accepted trade-off (see "Why Nonces Were Not Used" above),
  not an oversight. It means a hypothetical future stored-XSS
  vulnerability that managed to inject an executable inline `<script>`
  or `style` attribute would not be blocked by this CSP alone — CSP
  here is one real layer of defense (blocking any *external* malicious
  script domain, restricting connect-src to only this site's real
  backend, preventing framing and object embeds), not a complete
  replacement for careful output-escaping elsewhere in the codebase
  (which this project already does — see `toJsonLdHtml()`'s own
  escaping of `</script>` sequences in teacher-supplied free text,
  audited in `docs/SECURITY_AUDIT_PROMPT84.md`).
- **The CSP is environment-dependent for `connect-src`.** If
  `NEXT_PUBLIC_SUPABASE_URL` is ever changed (a different Supabase
  project for a different environment) or left unset, the CSP
  automatically reflects that — no separate CSP update is needed when
  the Supabase project changes, but the app's real backend features
  would already be broken by an unset URL regardless of CSP.
- **If a real analytics provider, payment processor, or any other
  third-party script is connected in the future, this CSP must be
  updated at the same time** — connecting a new external script without
  adding its domain here would cause it to be silently blocked, not a
  security bug but a real functional one to watch for.
- **`report-uri`/`report-to` was not configured.** This project has no
  server-side endpoint to receive CSP violation reports, and inventing
  one wasn't in scope for this pass — violations would currently only
  be visible in a visitor's own browser console, not centrally
  collected. A real reporting endpoint is a reasonable future addition
  once there's infrastructure to receive it.

## Testing Performed

- Read `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`
  in full before writing any code, per this project's own
  AGENTS.md convention for a framework this unfamiliar version-specific.
- Repo-wide searches before writing the policy, not after: every
  `dangerouslySetInnerHTML` use (confirmed JSON-LD only), every inline
  `style={{}}` use (three real, dynamic cases), every `<iframe>` (zero),
  every external `fetch()` call (only Supabase), every external
  stylesheet/font link (zero — fonts are self-hosted).
- `curl -I` against a running local server confirmed the real
  `Content-Security-Policy` header value is actually sent, with the
  real, live Supabase URL correctly interpolated into `connect-src`.
- Live-tested in the browser, checking the console for CSP violations
  after each of the following (all clean — no CSP-related console
  messages, no blocked network requests):
  - Homepage
  - A learning category page (`/learn/mathematics`) — confirmed its
    JSON-LD structured data renders without a script-src violation.
  - Two games, including the one game
    (`/games/color-match`) with a genuinely dynamic inline
    `style={{backgroundColor}}` — confirmed visually via screenshot
    that the colored swatch actually renders (not silently dropped by
    style-src), not just "no console error."
  - `/sign-in` — submitted real credentials and confirmed the request
    to Supabase's Auth API was **not** blocked by `connect-src`: the
    page showed a real "Incorrect email or password" response from
    Supabase itself, not a CSP-blocked failure (which would show as a
    console "Refused to connect" message with no HTTP response at
    all).
  - `/dashboard` and `/dashboard/applications/new` while signed out —
    confirmed the existing server-side redirect to `/sign-in` still
    works, unrelated to and unaffected by the CSP change.
  - `/admin/login` → real admin sign-in with the configured passphrase
    → `/admin/users` — confirmed the entirely separate admin
    authentication system is unaffected.
  - `/teachers/register`, `/support`, `/privacy`, `/terms` — all load
    cleanly.
  - Mobile viewport (375px) on the homepage — no horizontal overflow,
    and the CSP-dependent inline animation styles still render
    correctly.
  - One stray `[error] Failed to load resource: 400` seen mid-session
    was investigated and confirmed to be the real, expected Supabase
    "invalid credentials" response from a deliberate wrong-password
    test earlier in the same browser tab — reproduced in a **fresh**
    tab with no prior history to confirm it does not appear on a
    genuinely clean load of any page, and confirmed it cannot be a CSP
    violation in any case (CSP blocks a request before it is ever
    sent, which never produces an HTTP status code at all).
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `npx vitest run` — full suite passing; no test needed updating for a
  configuration-only change, and no existing test was weakened.
- `rm -rf .next && npx next build` — clean production build, same
  route count as before this change, confirming the CSP addition
  introduced no build-time regression.
