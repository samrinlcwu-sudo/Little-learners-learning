/** Lowercases, strips anything but letters/numbers/spaces/hyphens, and collapses whitespace into single hyphens. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A short, non-cryptographic random suffix (base36) — just enough to keep generated slugs from colliding, not a security token. */
export function randomSlugSuffix(length = 5): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
}
