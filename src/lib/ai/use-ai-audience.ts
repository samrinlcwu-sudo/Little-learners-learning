"use client";

import { usePathname } from "next/navigation";
import { getAiAudience } from "./audience";
import type { AiAudience } from "./types";

/** The one place a component reads "who is asking" from the current route. */
export function useAiAudience(): AiAudience {
  const pathname = usePathname();
  return getAiAudience(pathname ?? "/");
}
