import Image from "next/image";
import { siteConfig } from "@/config/site";

function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6 lg:px-8">
        <Image
          src="/brand/little-learners-learning-logo.png"
          alt={siteConfig.name}
          width={32}
          height={32}
          className="size-8 w-auto object-contain opacity-80"
        />
        <p className="text-sm text-neutral-600">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export { SiteFooter };
