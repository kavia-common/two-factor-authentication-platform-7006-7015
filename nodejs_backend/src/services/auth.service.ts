import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { UsersRepository } from '../repositories/users.repository.js';
import { ChallengesRepository } from '../repositories/challenges.repository.js';
import { SessionsRepository } from '../repositories/sessions.repository.js';
import { InMemoryDB } from '../db/index.js';

export interface LoginResult2FA {
  requires2fa: true;
  challengeId: string;
}

export interface LoginResultDirect {
  requires2fa: false;
  token: string;
}

type LoginResult = LoginResult2FA | LoginResultDirect;

export class AuthService {
  constructor(
    private readonly db: InMemoryDB,
    private readonly users = new UsersRepository(db),
    private readonly challenges = new ChallengesRepository(db),
    private readonly sessions = new SessionsRepository(db)
  ) {}

  // PUBLIC_INTERFACE
  async login(email: string, password: string): Promise<LoginResult> {
    /** Validates user credentials. If 2FA enabled, creates a challenge; else issues a JWT. */
    const user = await this.users.findByEmail(email);
    if (!user || user.passwordHash !== password) {
      const err: any = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    if (user.twoFaEnabled) {
      const challengeId = nanoid(18);
      const tempToken = nanoid(24);
      await this.challenges.create({
        id: challengeId,
        userId: user.id,
        tempToken,
        code: '123456',
        expiresAt: Date.now() + 5 * 60 * 1000
      });
      return { requires2fa: true, challengeId };
    }

    const token = this.signJWT({ sub: user.id, email: user.email });
    return { requires2fa: false, token };
  }

  // PUBLIC_INTERFACE
  async getChallengeById(challengeId: string) {
    /** Returns a challenge by id if it exists. */
    for (const ch of this.db.challenges.values()) {
      if (ch.id === challengeId) return ch;
    }
    return undefined;
  }

  // PUBLIC_INTERFACE
  async verify2fa(challengeId: string, code: string): Promise<string> {
    /** Verifies 2FA code for a challenge and issues a JWT. */
    const challenge = await this.getChallengeById(challengeId);
    if (!challenge) {
      const err: any = new Error('Invalid or expired challenge');
      err.status = 401;
      throw err;
    }
    if (challenge.expiresAt < Date.now()) {
      await this.challenges.delete(challenge.id);
      const err: any = new Error('Challenge expired');
      err.status = 401;
      throw err;
    }
    if (challenge.code !== code) {
      const err: any = new Error('Invalid 2FA code');
      err.status = 401;
      throw err;
    }

    const token = this.signJWT({ sub: challenge.userId });
    await this.sessions.create({
      id: nanoid(18),
      userId: challenge.userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000
    });
    await this.challenges.delete(challenge.id);
    return token;
  }

  // PUBLIC_INTERFACE
  async resend2fa(challengeId: string): Promise<void> {
    /** Regenerates a new code and extends expiration for an existing challenge. */
    const ch = await this.getChallengeById(challengeId);
    if (!ch) {
      const err: any = new Error('Challenge not found');
      err.status = 404;
      throw err;
    }
    ch.code = '123456'; // regenerate same demo code; in real app, generate new code and send it
    ch.expiresAt = Date.now() + 5 * 60 * 1000;
    this.db.challenges.set(ch.id, ch);
  }

  // PUBLIC_INTERFACE
  async meFromToken(token: string): Promise<{ id: string; email: string }> {
    /** Validates a bearer token and returns user info. */
    const payload = this.verifyJWT(token) as any;
    const userId = payload?.sub as string;
    if (!userId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
    const user = await this.users.findById(userId);
    if (!user) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
    return { id: user.id, email: user.email };
  }

  private signJWT(payload: object, expiresIn: string | number = '1h') {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured. Please set it in the environment.');
    }
    return jwt.sign(payload, secret, { expiresIn });
  }

  private verifyJWT(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured. Please set it in the environment.');
    }
    return jwt.verify(token, secret);
  }
}
