import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Deliberately the framework's own documented "static" CSP pattern
 * (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md,
 * "Without Nonces"), not the nonce-based one — the nonce pattern requires
 * *every* page to switch to dynamic rendering (the docs state this
 * plainly: "Static optimization and Incremental Static Regeneration are
 * disabled... Higher hosting costs"), which would undo this entire
 * project's static-generation architecture (71+ statically prerendered
 * routes) for a single header. That trade-off was rejected as
 * disproportionate to what this site's real threat model needs. Prompt
 * 113.
 *
 * `script-src`/`style-src` need `'unsafe-inline'` because this app
 * genuinely uses both, verified by direct search before writing this
 * policy, not assumed:
 * - Every JSON-LD block on the site (`src/lib/seo/json-ld.ts`,
 *   `dangerouslySetInnerHTML` in ~16 files) is a `<script>` element.
 *   Browsers apply `script-src` to *every* `<script>` tag regardless of
 *   its `type`, even a non-executable `application/ld+json` block — so
 *   this is required even though none of that content can ever run as
 *   JavaScript.
 * - A handful of real, dynamic inline `style={{}}` props exist
 *   (`src/app/page.tsx`'s per-element animation delays,
 *   `color-match-game.tsx`'s dynamically-chosen swatch color,
 *   `teacher-dashboard.tsx`'s profile-completion bar width) — values
 *   computed per-render, not expressible as a static Tailwind class.
 *
 * `connect-src` allows the real, configured Supabase project URL
 * (`NEXT_PUBLIC_SUPABASE_URL`) — every sign-in, sign-up, and
 * child/teacher/application read or write is a `fetch()` from the
 * browser straight to that URL (`@supabase/ssr`); without this, CSP
 * would silently block every one of those calls. Read from the same
 * environment variable every other Supabase reference in this codebase
 * uses — never hardcoded to one specific project, so this stays correct
 * if a different project is configured in another environment. Falls
 * back to allowing nothing extra when unset, matching
 * `isSupabaseConfigured`'s own fail-closed shape elsewhere in this
 * codebase.
 *
 * No other third-party domain appears anywhere: no analytics script is
 * active (`src/lib/analytics/track.ts` is a no-op — see
 * docs/SEARCH_MONITORING_PLAN.md), no payment provider is connected, no
 * iframe exists anywhere in this codebase (`grep -rl "<iframe"` — zero
 * matches), and fonts are self-hosted by `next/font` at build time, never
 * fetched from Google's servers at request time.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self'${supabaseUrl ? ` ${supabaseUrl}` : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Only takes effect over a real HTTPS connection (browsers ignore it on
  // plain HTTP, e.g. this local dev/prod server) — no `preload` directive,
  // since submitting to browsers' built-in preload list is close to
  // irreversible and is a deliberate choice for whoever controls the real
  // production domain to make, not something to opt this project into by
  // default. Production deployment audit, Prompt 98.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
];

const nextConfig: NextConfig = {
  // Removes the `X-Powered-By: Next.js` response header — a small,
  // standard hardening step (don't advertise the framework for free) with
  // no functional effect. Production deployment audit, Prompt 98.
  poweredByHeader: false,
  // Next's default is WebP only. AVIF is added ahead of it (the optimizer
  // picks the first format the requesting browser supports) because it
  // compresses this site's one real photographic/gradient-heavy asset
  // (the brand logo) noticeably better than WebP — and every image on
  // this site is small and rare enough that the extra encode cost is
  // negligible. Image, illustration & asset audit, Prompt 80.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
