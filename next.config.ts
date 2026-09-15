import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
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
