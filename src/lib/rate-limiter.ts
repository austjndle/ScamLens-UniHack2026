/**
 * Simple in-memory token bucket rate limiter for serverless / edge runtime.
 * Prevents API abuse and sets HTTP 429 headers.
 */
interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitRecord>();

// Clean old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now - record.lastRefill > 10 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export interface RateLimitOptions {
  limit: number; // Max requests
  windowMs: number; // Time window in ms
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 20, windowMs: 60 * 1000 }
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = store.get(identifier) || { tokens: options.limit, lastRefill: now };

  // Calculate tokens replenished
  const timePassed = now - record.lastRefill;
  const replenishmentRate = options.limit / options.windowMs;
  const tokensToAdd = timePassed * replenishmentRate;

  record.tokens = Math.min(options.limit, record.tokens + tokensToAdd);
  record.lastRefill = now;

  if (record.tokens >= 1) {
    record.tokens -= 1;
    store.set(identifier, record);
    return {
      allowed: true,
      remaining: Math.floor(record.tokens),
      resetInMs: Math.ceil((1 - record.tokens) / replenishmentRate),
    };
  }

  store.set(identifier, record);
  return {
    allowed: false,
    remaining: 0,
    resetInMs: Math.ceil((1 - record.tokens) / replenishmentRate),
  };
}
