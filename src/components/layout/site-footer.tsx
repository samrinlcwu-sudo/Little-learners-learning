import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { footerNav } from "@/config/nav";

function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-3">
            <Image
              src="/brand/little-learners-learning-logo.png"
              alt={siteConfig.name}
              width={44}
              height={44}
              className="size-11 w-auto object-contain"
            />
            <p className="max-w-xs text-sm text-neutral-600">
              {siteConfig.name} — an early-years learning platform, currently
              in development.
            </p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold text-ink">{group.title}</h2>
              <ul className="mt-3 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-600 transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-10 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export { SiteFooter };
