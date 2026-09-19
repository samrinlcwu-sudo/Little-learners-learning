import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

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
 *
 * Prompt 110 adds the second real gate this codebase has: real Supabase
 * session handling for parent/teacher routes, deliberately kept as a
 * second, independent branch rather than merged into the admin logic
 * above — the two systems don't share a session format, a cookie, or a
 * "role," and forcing them into one code path would be exactly the kind
 * of unnecessary rebuild this project's own standing rules warn against.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isValid = await verifyAdminSessionToken(token);
    if (isValid) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Every real parent/teacher account route. Fails closed the same way the
  // admin branch does: if Supabase isn't configured, there is no session to
  // refresh or check, so every one of these routes redirects to sign-in
  // rather than silently falling back to the old "no guard at all" state.
  const isProtectedAccountRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/teachers/dashboard") ||
    pathname === "/teachers/register/profile";

  if (!isSupabaseConfigured) {
    if (isProtectedAccountRoute) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  const { response, user } = await updateSupabaseSession(request);

  if (isProtectedAccountRoute && !user) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/teachers/dashboard/:path*", "/teachers/register/profile"],
};
