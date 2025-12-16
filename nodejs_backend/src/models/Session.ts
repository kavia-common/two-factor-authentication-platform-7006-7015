export interface Session {
  id: string;
  userId: string;
  createdAt: number; // epoch ms
  expiresAt?: number; // epoch ms
}
