/**
 * Every JSON-LD `<script>` on this site is rendered via
 * `dangerouslySetInnerHTML={{ __html: ... }}`, because React has no other
 * way to emit a raw `<script>` tag's text content. `JSON.stringify` alone
 * is not safe to drop straight into that position: it does not escape the
 * `/` in `</`, so a value containing the literal string `</script>`
 * — a teacher's own headline or bio (`buildTeacherPersonSchema`,
 * `src/lib/seo/author-schema.ts`) is genuinely free text they control —
 * would prematurely close the script tag and let arbitrary HTML/script
 * after it execute in every visitor's browser. This is the single place
 * that risk is closed, so every JSON-LD embed across the site is safe by
 * construction rather than by each call site remembering to think about
 * it. Security audit, Prompt 84.
 */
export function toJsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
