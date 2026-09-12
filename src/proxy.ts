import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";

/**
 * The real server-side gate Prompt 57 requires (docs/ADMIN_ARCHITECTURE.md)
 * — this is the first Proxy file anywhere in this codebase (Next.js 16
 * renamed the `middleware.ts` convention to `proxy.ts` — see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 * Every `/admin/*` request is checked here, before any page component
 * (and therefore before any moderation control, any teacher/child data,
 * any admin JS bundle) is ever served — a visitor without a valid signed
 * session cookie never receives the page at all, not "receives it with
 * buttons hidden." `/admin/login` is deliberately exempt: it has to be
 * reachable by someone who isn't authenticated yet, or nobody could ever
 * sign in.
 *
 * Fails closed: if `ADMIN_SESSION_SECRET`/`ADMIN_PASSPHRASE` aren't
 * configured (`isAdminAuthConfigured()`), `verifyAdminSessionToken()`
 * always returns `false` — there is no "admin auth not configured, so
 * let everyone through" branch anywhere in this file. An unconfigured
 * deployment blocks admin access entirely rather than accidentally
 * leaving it open.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = await verifyAdminSessionToken(token);
  if (isValid) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
