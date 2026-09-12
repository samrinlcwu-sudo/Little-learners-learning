"use server";

import { cookies } from "next/headers";
import { isAdminAuthConfigured } from "./config";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  verifyAdminPassphrase,
} from "./session";

export interface AdminLoginState {
  error?: string;
  success?: boolean;
}

/**
 * Real server-side authentication — the passphrase check and the signed
 * session cookie both happen here, in a Server Action, never in client
 * code that a browser's dev tools could bypass. Deliberately doesn't
 * `redirect()` on success: it returns `{ success: true }` instead, so the
 * client form (`admin-login-form.tsx`) can record a real audit event
 * (`recordAdminAuditEvent`, client-side localStorage) and then navigate —
 * a `redirect()` here would leave before that ever ran.
 */
export async function adminLoginAction(_prevState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  if (!isAdminAuthConfigured()) {
    return { error: "Admin login isn't configured on this deployment yet — see docs/ADMIN_ARCHITECTURE.md." };
  }

  const passphrase = String(formData.get("passphrase") ?? "");
  const valid = await verifyAdminPassphrase(passphrase);
  if (!valid) {
    return { error: "Incorrect passphrase." };
  }

  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  return { success: true };
}

/** Clears the real session cookie server-side. Same reasoning as `adminLoginAction` for not redirecting here. */
export async function adminLogoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
