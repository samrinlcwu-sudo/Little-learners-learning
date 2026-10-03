export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult;
}

const SWEEP_THRESHOLD = 5000;

/**
 * A sliding-window limiter held in this server instance's memory. Honest
 * about what that means on a serverless host: each warm instance keeps its
 * own counts, so this blunts a single client hammering the endpoint but is
 * not a global quota — the real spend ceiling is the monthly limit set in
 * the Anthropic console. No external store (Redis, a database) exists in
 * this project to make it stronger, the same trade-off already disclosed for
 * the admin login throttle (src/lib/admin/login-rate-limit.ts).
 */
export function createRateLimiter({ maxRequests, windowMs }: { maxRequests: number; windowMs: number }): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

      if (recent.length >= maxRequests) {
        hits.set(key, recent);
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
      }

      recent.push(now);
      hits.set(key, recent);

      if (hits.size > SWEEP_THRESHOLD) {
        for (const [k, times] of hits) {
          if (times.every((t) => now - t >= windowMs)) hits.delete(k);
        }
      }

      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
