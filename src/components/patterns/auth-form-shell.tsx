import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { siteConfig } from "@/config/site";

export interface AuthFormShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * The shared shell every auth screen (sign in/up, forgot/reset password)
 * renders inside — logo, a centered card, and an optional footer link to
 * the alternate action. Deliberately plain: no breadcrumb, no decorative
 * blobs, nothing that competes with the one thing a visitor is here to do.
 */
function AuthFormShell({ title, description, children, footer }: AuthFormShellProps) {
  return (
    <Section surface="sunken" className="flex flex-1 items-center py-12 sm:py-16">
      <Container className="max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
          >
            <Image
              src="/brand/little-learners-learning-logo.png"
              alt={siteConfig.name}
              width={48}
              height={48}
              className="size-12 w-auto object-contain"
            />
          </Link>
        </div>

        <Card className="p-6 sm:p-8">
          <Heading level="h3" as="h1" className="text-center">
            {title}
          </Heading>
          <p className="mt-2 text-center text-sm text-neutral-600">{description}</p>
          <div className="mt-6">{children}</div>
        </Card>

        {footer && <p className="mt-6 text-center text-sm text-neutral-600">{footer}</p>}
      </Container>
    </Section>
  );
}

export { AuthFormShell };
