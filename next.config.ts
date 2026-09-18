import type { NextConfig } from "next";

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
