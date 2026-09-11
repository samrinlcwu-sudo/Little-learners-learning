/**
 * Site-wide constants. Centralized so brand name, URLs, and metadata defaults
 * are defined once and reused across layouts, SEO metadata, and future features.
 */
export const siteConfig = {
  name: "Little Learners Learning",
  shortName: "Little Learners Learning",
  description:
    "An early-years learning platform bringing literacy, math, life skills, creativity, and foundational Qur'an learning together — built for parents and teachers, not just kids.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "thelittlelearnerslearning@gmail.com",
} as const;
