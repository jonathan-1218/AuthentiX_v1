/**
 * In-process rate limiter using a sliding-window counter.
 *
 * Limitations vs. a Redis-backed limiter:
 *  - Resets on process restart (fine for single-instance deployments)
 *  - Does not share state across multiple Next.js workers
 *
 * Each entry is evicted lazily when its window expires, keeping memory bounded.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // unix ms
}

const store = new Map<string, RateLimitEntry>();

// Periodically purge entries whose window has elapsed to prevent unbounded growth.
// Runs every 5 minutes if the module is loaded in a long-lived process.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key);
    });
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  /** Value for the Retry-After HTTP header (seconds until reset) */
  retryAfter: number;
}

/**
 * Check and increment the rate limit for `key`.
 *
 * @param key        Unique bucket key — combine IP and/or userId: `login:${ip}`
 * @param maxRequests  Maximum allowed hits inside the window
 * @param windowMs   Window length in milliseconds
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Window expired or first hit — start a fresh window
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt, retryAfter: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, retryAfter };
  }

  entry.count += 1;
  const remaining = maxRequests - entry.count;
  return { allowed: true, remaining, resetAt: entry.resetAt, retryAfter: 0 };
}

/**
 * Build a combined IP + authenticated-user key.
 * Falls back to IP-only when userId is absent (public endpoints).
 */
export function buildRateLimitKey(
  prefix: string,
  ip: string,
  userId?: string | null
): string {
  return userId ? `${prefix}:user:${userId}` : `${prefix}:ip:${ip}`;
}

// ── Per-endpoint defaults ────────────────────────────────────────────────────

/** Auth login: 10 attempts per 15 min per IP */
export const LIMITS = {
  LOGIN:          { max: 10,  windowMs: 15 * 60 * 1000 },
  REGISTER:       { max: 5,   windowMs: 60 * 60 * 1000 },  // 5/hr per IP
  REFRESH:        { max: 20,  windowMs: 15 * 60 * 1000 },  // 20 per 15 min per IP
  SENSOR_DATA:    { max: 120, windowMs: 60 * 60 * 1000 },  // 120/hr per user
  QR:             { max: 60,  windowMs: 60 * 1000 },       // 60/min per IP
  VERIFY:         { max: 30,  windowMs: 60 * 1000 },       // 30/min per IP
  BLOCKCHAIN_OP:  { max: 10,  windowMs: 60 * 60 * 1000 },  // 10/hr per user
} as const;
