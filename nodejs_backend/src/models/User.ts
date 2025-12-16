export interface User {
  id: string;
  email: string;
  passwordHash: string; // Demo only, not hashed in this mock
  twoFaEnabled: boolean;
  twoFaSecret?: string;
}
