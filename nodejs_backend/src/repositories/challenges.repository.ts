import { InMemoryDB } from '../db/index.js';
import { TwoFaChallenge } from '../models/TwoFaChallenge.js';

export class ChallengesRepository {
  constructor(private readonly db: InMemoryDB) {}

  async create(challenge: TwoFaChallenge): Promise<TwoFaChallenge> {
    this.db.challenges.set(challenge.id, challenge);
    return challenge;
  }

  async findByTempToken(tempToken: string): Promise<TwoFaChallenge | undefined> {
    for (const ch of this.db.challenges.values()) {
      if (ch.tempToken === tempToken) return ch;
    }
    return undefined;
  }

  async delete(id: string): Promise<void> {
    this.db.challenges.delete(id);
  }
}
