import { Router } from 'express';
import { z } from 'zod';
import { db } from '../server.js';
import { AuthService } from '../services/auth.service.js';
import { bearerAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Schemas
const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(1, 'Password is required')
});

const VerifySchema = z.object({
  challengeId: z.string().min(8),
  code: z.string().min(6).max(8)
});

const ResendSchema = z.object({
  challengeId: z.string().min(8)
});

// PUBLIC_INTERFACE
router.post('/login', async (req, res) => {
  /** POST /auth/login: accepts {email, password}. Returns {requires2fa:true, challengeId} or {token}. */
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  const svc = new AuthService(db);
  try {
    const result = await svc.login(parsed.data.email, parsed.data.password);
    if (result.requires2fa) {
      return res.json({ requires2fa: true, challengeId: result.challengeId });
    }
    return res.json({ token: result.token });
  } catch (e: any) {
    return res.status(e?.status || 500).json({ message: e?.message || 'Login failed' });
  }
});

// PUBLIC_INTERFACE
router.post('/2fa/verify', async (req, res) => {
  /** POST /auth/2fa/verify: accepts {challengeId, code}. Returns {token} if valid and not expired. */
  const parsed = VerifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  const svc = new AuthService(db);
  try {
    const token = await svc.verify2fa(parsed.data.challengeId, parsed.data.code);
    return res.json({ token });
  } catch (e: any) {
    return res.status(e?.status || 500).json({ message: e?.message || 'Verification failed' });
  }
});

// PUBLIC_INTERFACE
router.post('/2fa/resend', async (req, res) => {
  /** POST /auth/2fa/resend: accepts {challengeId}. Regenerates code; returns {ok:true}. */
  const parsed = ResendSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  const svc = new AuthService(db);
  try {
    await svc.resend2fa(parsed.data.challengeId);
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(e?.status || 500).json({ message: e?.message || 'Resend failed' });
  }
});

// PUBLIC_INTERFACE
router.get('/me', bearerAuth, async (req, res) => {
  /** GET /auth/me: returns {email, id} when Authorization Bearer token is valid; 401 otherwise. */
  const hdr = (req.headers['authorization'] || '') as string;
  const [, token] = hdr.split(' ');
  const svc = new AuthService(db);
  try {
    const me = await svc.meFromToken(token);
    return res.json(me);
  } catch (e: any) {
    return res.status(e?.status || 401).json({ message: 'Unauthorized' });
  }
});

export { router as authRouter };
