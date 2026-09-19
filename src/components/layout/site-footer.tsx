import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { footerNav } from "@/config/nav";
import { ContactMailtoLink } from "@/components/patterns/contact-mailto-link";

function SiteFooter() {
  return (
    <footer className="bg-neutral-950 text-neutral-300">
      <div
        aria-hidden="true"
        className="h-1 bg-[linear-gradient(90deg,var(--color-primary-500)_0%,var(--color-cat-blue-600)_25%,var(--color-cat-coral-600)_50%,var(--color-accent-400)_75%,var(--color-cat-green-600)_100%)]"
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-3">
            <Image
              src="/brand/little-learners-learning-logo.png"
              alt={siteConfig.name}
              width={44}
              height={44}
              className="size-11 w-auto rounded-lg object-contain"
            />
            <p className="max-w-xs text-sm text-neutral-400">
              {siteConfig.name} — an early-years learning platform, currently
              in development.
            </p>
            <ContactMailtoLink
              email={siteConfig.email}
              className="text-sm text-neutral-400 underline-offset-4 transition-colors hover:text-white hover:underline"
            />
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold text-white">{group.title}</h2>
              <ul className="mt-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block py-2 text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export { SiteFooter };
