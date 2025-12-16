import { InMemoryDB } from '../db/index.js';
import { User } from '../models/User.js';

export class UsersRepository {
  constructor(private readonly db: InMemoryDB) {}

  async findByEmail(email: string): Promise<User | undefined> {
    for (const u of this.db.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.db.users.get(id);
  }

  async save(user: User): Promise<User> {
    this.db.users.set(user.id, user);
    return user;
  }
}
