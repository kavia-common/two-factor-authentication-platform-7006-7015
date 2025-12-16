import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// PUBLIC_INTERFACE
export function bearerAuth(req: Request & { user?: any }, res: Response, next: NextFunction) {
  /** Validates Authorization Bearer token and attaches payload to req.user, else 401. */
  try {
    const hdr = req.headers['authorization'] || '';
    const [, token] = (hdr as string).split(' ');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured. Please set it in the environment.');
    }
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
