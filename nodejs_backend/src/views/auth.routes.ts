import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { UsersRepository } from '../repositories/users.repository.js';
import { SessionsRepository } from '../repositories/sessions.repository.js';
import { ChallengesRepository } from '../repositories/challenges.repository.js';
import { db } from '../server.js';

const router = Router();

// Schemas
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const VerifySchema = z.object({
  code: z.string().min(6).max(8),
  tempToken: z.string().min(10)
});

// Helpers
function signJWT(payload: object, expiresIn: string | number = '1h') {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Please set it in the environment.');
  }
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * POST /auth/login
 * Returns:
 *  - if user has 2FA enabled: { requires2fa: true, tempToken }
 *  - else: { requires2fa: false, token }
 */
// PUBLIC_INTERFACE
router.post('/login', async (req, res) => {
  /** Login endpoint: verifies email/password and initiates 2FA if enabled. */
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  const { email, password } = parsed.data;
  const usersRepo = new UsersRepository(db);
  const user = await usersRepo.findByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.twoFaEnabled) {
    // Create a temporary challenge; for demo, accept code "123456"
    const tempToken = nanoid(24);
    const challengeId = nanoid(18);
    const challenge = {
      id: challengeId,
      userId: user.id,
      tempToken,
      code: '123456',
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 min
    };
    const challengesRepo = new ChallengesRepository(db);
    await challengesRepo.create(challenge);
    return res.json({ requires2fa: true, tempToken });
  } else {
    const token = signJWT({ sub: user.id, email: user.email });
    return res.json({ requires2fa: false, token });
  }
});

/**
 * POST /auth/verify-2fa
 * Body: { code, tempToken }
 * Returns: { token }
 */
// PUBLIC_INTERFACE
router.post('/verify-2fa', async (req, res) => {
  /** Verifies the 2FA code using a temp token and returns a final JWT. */
  const parsed = VerifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  const { code, tempToken } = parsed.data;
  const challengesRepo = new ChallengesRepository(db);
  const challenge = await challengesRepo.findByTempToken(tempToken);
  if (!challenge) {
    return res.status(401).json({ message: 'Invalid or expired challenge' });
  }
  if (challenge.expiresAt < Date.now()) {
    await challengesRepo.delete(challenge.id);
    return res.status(401).json({ message: 'Challenge expired' });
  }
  if (challenge.code !== code) {
    return res.status(401).json({ message: 'Invalid 2FA code' });
  }

  // Issue final JWT
  const token = signJWT({ sub: challenge.userId });
  await challengesRepo.delete(challenge.id);

  // Optionally create a session record (not used by middleware yet)
  const sessionsRepo = new SessionsRepository(db);
  await sessionsRepo.create({
    id: nanoid(18),
    userId: challenge.userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000
  });

  return res.json({ token });
});

export { router as authRouter };
