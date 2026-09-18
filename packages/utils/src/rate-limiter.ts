export type RateLimitCategory =
  | 'auth'
  | 'otp'
  | 'payments'
  | 'documents'
  | 'admin'
  | 'default';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSeconds: number;
}

export const RATE_LIMIT_CONFIGS: Record<RateLimitCategory, RateLimitConfig> = {
  auth: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  },
  otp: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 attempts per minute
  },
  payments: {
    maxRequests: 15,
    windowMs: 60 * 1000, // 15 requests per minute
  },
  documents: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 uploads/downloads per minute
  },
  admin: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 60 requests per minute
  },
  default: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },
};

// In-memory sliding window store: key -> array of request timestamps (in ms)
const requestLogs: Map<string, number[]> = new Map();

/**
 * Checks whether a given identifier has exceeded the rate limit threshold for a category.
 */
export function checkRateLimit(
  identifier: string,
  category: RateLimitCategory = 'default',
  customConfig?: Partial<RateLimitConfig>
): RateLimitResult {
  const now = Date.now();
  const config: RateLimitConfig = {
    ...RATE_LIMIT_CONFIGS[category],
    ...customConfig,
  };

  const key = `${category}:${identifier}`;
  const windowStart = now - config.windowMs;

  let timestamps = requestLogs.get(key) || [];
  // Filter out timestamps outside the sliding window
  timestamps = timestamps.filter((ts) => ts > windowStart);

  if (timestamps.length >= config.maxRequests) {
    const oldestTimestamp = timestamps[0] || windowStart;
    const resetTimeMs = oldestTimestamp + config.windowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

    requestLogs.set(key, timestamps);

    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTimeMs,
      retryAfterSeconds,
    };
  }

  timestamps.push(now);
  requestLogs.set(key, timestamps);

  const resetTimeMs = now + config.windowMs;
  const remaining = Math.max(0, config.maxRequests - timestamps.length);

  return {
    allowed: true,
    limit: config.maxRequests,
    remaining,
    resetTimeMs,
    retryAfterSeconds: 0,
  };
}

/**
 * Helper to generate standard rate limit HTTP headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTimeMs / 1000).toString(),
  };

  if (!result.allowed) {
    headers['Retry-After'] = result.retryAfterSeconds.toString();
  }

  return headers;
}

/**
 * Reset all rate limit records (useful in test setups)
 */
export function resetRateLimiter(): void {
  requestLogs.clear();
}
