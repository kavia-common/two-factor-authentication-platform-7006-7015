import { InMemoryDB } from '../db/index.js';
import { Session } from '../models/Session.js';

export class SessionsRepository {
  constructor(private readonly db: InMemoryDB) {}

  async create(session: Session): Promise<Session> {
    this.db.sessions.set(session.id, session);
    return session;
  }

  async findById(id: string): Promise<Session | undefined> {
    return this.db.sessions.get(id);
  }

  async delete(id: string): Promise<void> {
    this.db.sessions.delete(id);
  }
}
