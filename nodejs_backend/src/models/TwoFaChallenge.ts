export interface TwoFaChallenge {
  id: string;
  userId: string;
  tempToken: string;
  code: string; // For demo; in real app verify TOTP
  expiresAt: number; // epoch ms
}
