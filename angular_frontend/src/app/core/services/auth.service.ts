import { Injectable, signal } from '@angular/core';
import { getSessionStorage } from '../utils/platform';

/**
 * AuthService manages JWT token and 2FA challenge state using sessionStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSig = signal<string | null>(this.load('auth.jwt'));
  private challengeIdSig = signal<string | null>(this.load('auth.challengeId'));

  // PUBLIC_INTERFACE
  get token(): string | null {
    /** Returns the authenticated JWT token, if verified. */
    return this.tokenSig();
  }

  // PUBLIC_INTERFACE
  setToken(jwt: string | null) {
    /** Sets final JWT token and clears challenge. */
    this.tokenSig.set(jwt);
    this.setChallengeId(null);
    const store = getSessionStorage();
    if (store) {
      if (jwt) {
        store.setItem('auth.jwt', jwt);
      } else {
        store.removeItem('auth.jwt');
      }
    }
  }

  // PUBLIC_INTERFACE
  setChallengeId(id: string | null) {
    /** Sets 2FA challenge id. */
    this.challengeIdSig.set(id);
    const store = getSessionStorage();
    if (store) {
      if (id) {
        store.setItem('auth.challengeId', id);
      } else {
        store.removeItem('auth.challengeId');
      }
    }
  }

  // PUBLIC_INTERFACE
  get challengeId(): string | null {
    /** Returns active 2FA challenge id. */
    return this.challengeIdSig();
  }

  // PUBLIC_INTERFACE
  isAuthenticated(): boolean {
    /** Indicates whether a final JWT is present. */
    return !!this.tokenSig();
  }

  // PUBLIC_INTERFACE
  logout() {
    /** Clears tokens/state. */
    this.setToken(null);
    this.setChallengeId(null);
  }

  private load(key: string): string | null {
    try {
      const store = getSessionStorage();
      return store ? store.getItem(key) : null;
    } catch {
      return null;
    }
  }
}
