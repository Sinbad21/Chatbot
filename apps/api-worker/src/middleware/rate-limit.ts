/**
 * Rate Limiting Middleware
 * Prevents spam bookings from the same IP address
 */

import type { Context, Next } from 'hono';

// In-memory store for rate limiting (in production, use Redis)
const ipBookingAttempts = new Map<string, { count: number; resetAt: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipBookingAttempts.entries()) {
    if (now > data.resetAt) {
      ipBookingAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxAttempts: number; // Maximum booking attempts
  windowMs: number;    // Time window in milliseconds
  message?: string;    // Custom error message
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Troppi tentativi di prenotazione. Riprova tra un\'ora.',
};

/**
 * Get client IP address from request
 */
function getClientIP(c: Context): string {
  // Try various headers used by proxies/load balancers
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list
    return forwarded.split(',')[0].trim();
  }

  const realIP = c.req.header('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = c.req.header('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback (this won't work well on Cloudflare Workers)
  return 'unknown';
}

/**
 * Rate limit middleware for booking endpoints
 */
export function rateLimitBooking(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return async (c: Context, next: Next) => {
    const ip = getClientIP(c);

    if (ip === 'unknown') {
      // If we can't determine IP, allow the request but log it
      console.warn('Rate limit: Unable to determine client IP');
      return next();
    }

    const now = Date.now();
    const existing = ipBookingAttempts.get(ip);

    if (existing) {
      if (now > existing.resetAt) {
        // Window has expired, reset counter
        ipBookingAttempts.set(ip, {
          count: 1,
          resetAt: now + finalConfig.windowMs,
        });
        return next();
      } else {
        // Window is still active
        if (existing.count >= finalConfig.maxAttempts) {
          // Rate limit exceeded
          const retryAfter = Math.ceil((existing.resetAt - now) / 1000); // seconds

          return c.json(
            {
              error: finalConfig.message,
              retryAfter,
            },
            429,
            {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': finalConfig.maxAttempts.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': existing.resetAt.toString(),
            }
          );
        } else {
          // Increment counter
          existing.count++;
          const remaining = finalConfig.maxAttempts - existing.count;

          // Add rate limit headers
          c.header('X-RateLimit-Limit', finalConfig.maxAttempts.toString());
          c.header('X-RateLimit-Remaining', remaining.toString());
          c.header('X-RateLimit-Reset', existing.resetAt.toString());

          return next();
        }
      }
    } else {
      // First attempt from this IP
      ipBookingAttempts.set(ip, {
        count: 1,
        resetAt: now + finalConfig.windowMs,
      });

      // Add rate limit headers
      c.header('X-RateLimit-Limit', finalConfig.maxAttempts.toString());
      c.header('X-RateLimit-Remaining', (finalConfig.maxAttempts - 1).toString());
      c.header('X-RateLimit-Reset', (now + finalConfig.windowMs).toString());

      return next();
    }
  };
}

/**
 * Get current rate limit status for an IP
 */
export function getRateLimitStatus(ip: string): {
  attempts: number;
  remaining: number;
  resetAt: number;
} | null {
  const existing = ipBookingAttempts.get(ip);
  if (!existing) {
    return null;
  }

  return {
    attempts: existing.count,
    remaining: Math.max(0, defaultConfig.maxAttempts - existing.count),
    resetAt: existing.resetAt,
  };
}

/**
 * Clear rate limit for a specific IP (useful for testing or admin override)
 */
export function clearRateLimit(ip: string): void {
  ipBookingAttempts.delete(ip);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  ipBookingAttempts.clear();
}
