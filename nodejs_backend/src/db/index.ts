import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { TwoFaChallenge } from '../models/TwoFaChallenge.js';

export class InMemoryDB {
  users = new Map<string, User>();
  sessions = new Map<string, Session>();
  challenges = new Map<string, TwoFaChallenge>();

  constructor() {
    // Seed with a demo user (password: password123, 2FA enabled)
    const demo: User = {
      id: 'user_1',
      email: 'user@example.com',
      passwordHash: 'password123', // In real app, use bcrypt; for demo only
      twoFaEnabled: true,
      twoFaSecret: 'DEMO-SECRET' // For demo, not TOTP-validated here
    };
    this.users.set(demo.id, demo);
  }
}
