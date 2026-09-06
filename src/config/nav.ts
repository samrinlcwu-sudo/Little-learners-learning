/**
 * Single source of truth for primary and footer navigation, so the header,
 * footer, and sitemap never drift out of sync with each other.
 *
 * "Home" is intentionally excluded from the visible primary nav — the logo
 * already links there, and including it too just crowds the bar.
 */
export interface NavLink {
  label: string;
  href: string;
}

export const primaryNav: NavLink[] = [
  { label: "Learn", href: "/learn" },
  { label: "Resources", href: "/resources" },
  { label: "Games", href: "/games" },
  { label: "For Parents", href: "/parents" },
  { label: "For Teachers", href: "/teachers" },
  { label: "About", href: "/about" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Learn", href: "/learn" },
      { label: "Resources", href: "/resources" },
      { label: "Games", href: "/games" },
    ],
  },
  {
    title: "Who It's For",
    links: [
      { label: "For Parents", href: "/parents" },
      { label: "For Teachers", href: "/teachers" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Support", href: "/support" },
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];
