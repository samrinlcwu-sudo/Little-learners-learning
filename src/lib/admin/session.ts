/**
 * Real server-side admin authentication (Prompt 57) — genuinely
 * enforceable, not a client-side flag. There is still no accounts/session
 * backend for parents or teachers (`docs/ACCOUNTS_ARCHITECTURE.md`), so
 * this deliberately doesn't reuse or extend that non-existent system: it's
 * a single shared admin passphrase (`ADMIN_PASSPHRASE`), not a multi-admin
 * user table, because no such table exists to check a role against yet.
 * See docs/ADMIN_ARCHITECTURE.md for exactly what this is and isn't.
 *
 * Built entirely on the Web Crypto API (`crypto.subtle`, global in both
 * the Node.js runtime Server Actions use and the Edge runtime
 * `src/middleware.ts` uses) rather than Node's `crypto` module, so the
 * exact same signing/verification code runs in both places without a
 * runtime-specific branch.
 */

export const ADMIN_SESSION_COOKIE = "llad_session";
/** 8 hours — long enough for one real working session, short enough that a leaked cookie doesn't stay valid indefinitely. */
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of array) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

/** Fixed-length digest comparison — every branch does the same amount of work regardless of where a mismatch occurs, which is the property a passphrase check needs. */
async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyAdminPassphrase(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSPHRASE;
  if (!expected) return false;
  const [candidateHash, expectedHash] = await Promise.all([sha256Hex(candidate), sha256Hex(expected)]);
  if (candidateHash.length !== expectedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < candidateHash.length; i++) {
    mismatch |= candidateHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return mismatch === 0;
}

/** `{ exp }` only — deliberately carries no admin identity, since there is no multi-admin table for an id to reference. */
export async function createAdminSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  const exp = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify({ exp })));
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${toBase64Url(signature)}`;
}

/**
 * Verifies both the HMAC signature (via `crypto.subtle.verify`, itself
 * timing-safe — never a manual byte comparison of the signature) and the
 * expiry. Any malformed input fails closed via the catch, never throws
 * into a caller that might treat an exception as "let them through."
 */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return false;
  const [payloadB64, signatureB64] = token.split(".");
  if (!payloadB64 || !signatureB64) return false;
  try {
    const key = await getHmacKey(secret);
    const signatureBytes = fromBase64Url(signatureB64);
    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(payloadB64));
    if (!valid) return false;
    const { exp } = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64))) as { exp: unknown };
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}
