"use client";

import Link from "next/link";
import { useAuthorProfileHref } from "@/lib/accounts/use-author-profile-link";
import type { ContentAuthor } from "@/lib/content/types";

export interface AuthorLinkProps {
  author: ContentAuthor;
  className?: string;
}

/**
 * The one place an author's name is rendered as a real link when — and
 * only when — a real, viewable page exists for them (see
 * src/lib/accounts/author-profile-link.ts). Used inside otherwise-server
 * detail pages (resources, blog articles) as a small client island, so
 * "is this browser's local teacher profile the same person, and is it
 * public" can be checked without turning the whole page into a client
 * component. Plain, underlined text — never an icon or badge that could
 * read as a verification/trust mark this platform hasn't actually earned
 * for the author.
 */
function AuthorLink({ author, className }: AuthorLinkProps) {
  const href = useAuthorProfileHref(author);

  if (!href) {
    return <>{author.name}</>;
  }

  return (
    <Link href={href} className={className ?? "underline decoration-dotted underline-offset-2 hover:text-ink"}>
      {author.name}
    </Link>
  );
}

export { AuthorLink };
