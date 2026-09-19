import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

/**
 * The official Supabase + Next.js middleware pattern: refreshes the auth
 * cookie on every matched request (a Supabase session token expires and
 * needs rotating, unlike the admin system's own longer-lived signed
 * cookie) and returns the real signed-in user, if any, so `src/proxy.ts`
 * can gate protected routes without every page needing its own redirect
 * logic duplicated. Kept separate from `./client.ts`/`./server.ts` because
 * middleware's cookie API (`request.cookies` / a `NextResponse` to attach
 * `Set-Cookie` to) is shaped differently from both the browser client and
 * the Server Component `cookies()` helper.
 */
export async function updateSupabaseSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: import("@supabase/supabase-js").User | null }> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Never swap this for `getSession()` — that reads the (possibly stale)
  // cookie without revalidating it. `getUser()` re-checks with Supabase's
  // own auth server on every call, which is the real, server-verified
  // signal proxy.ts needs to gate a protected route on.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
