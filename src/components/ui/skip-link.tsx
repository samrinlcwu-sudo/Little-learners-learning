/**
 * Visually hidden until focused — the first tab stop on every page, letting
 * keyboard/screen-reader users jump past the header and nav straight to
 * the main content.
 */
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

export { SkipLink };
