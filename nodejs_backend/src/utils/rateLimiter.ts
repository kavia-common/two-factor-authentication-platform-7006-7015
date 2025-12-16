import { Request, Response, NextFunction } from 'express';

type Bucket = { points: number; resetAt: number };
const buckets: Map<string, Bucket> = new Map();

// PUBLIC_INTERFACE
export function rateLimiter() {
  /** Basic IP-based rate limiter using env RATE_LIMIT_POINTS and RATE_LIMIT_DURATION (seconds). */
  const maxPoints = Number(process.env.RATE_LIMIT_POINTS || 100);
  const windowSec = Number(process.env.RATE_LIMIT_DURATION || 60);

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
      const now = Date.now();
      let bucket = buckets.get(key);
      if (!bucket || bucket.resetAt < now) {
        bucket = { points: 0, resetAt: now + windowSec * 1000 };
        buckets.set(key, bucket);
      }
      bucket.points += 1;
      if (bucket.points > maxPoints) {
        const retryIn = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
        res.setHeader('Retry-After', retryIn.toString());
        return res.status(429).json({ message: 'Too Many Requests' });
      }
      next();
    } catch {
      next();
    }
  };
}
