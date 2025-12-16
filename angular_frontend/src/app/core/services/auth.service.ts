import { Injectable, signal } from '@angular/core';
import { getSessionStorage } from '../utils/platform';

/**
 * AuthService manages JWT token or temporary token lifecycle in memory and sessionStorage.
 * Avoids localStorage for better security; sessionStorage is used to survive reloads.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSig = signal<string | null>(this.load('auth.jwt'));
  private tempTokenSig = signal<string | null>(this.load('auth.temp'));

  // PUBLIC_INTERFACE
  get token(): string | null {
    /** Returns the authenticated JWT token, if verified. */
    return this.tokenSig();
  }

  // PUBLIC_INTERFACE
  setToken(jwt: string | null) {
    /** Sets final JWT token and clears temp token. */
    this.tokenSig.set(jwt);
    this.tempTokenSig.set(null);
    const store = getSessionStorage();
    if (store) {
      if (jwt) {
        store.setItem('auth.jwt', jwt);
        store.removeItem('auth.temp');
      } else {
        store.removeItem('auth.jwt');
      }
    }
  }

  // PUBLIC_INTERFACE
  setTempToken(token: string | null) {
    /** Sets temporary token for 2FA step. */
    this.tempTokenSig.set(token);
    const store = getSessionStorage();
    if (store) {
      if (token) {
        store.setItem('auth.temp', token);
      } else {
        store.removeItem('auth.temp');
      }
    }
  }

  // PUBLIC_INTERFACE
  get tempToken(): string | null {
    /** Returns temporary token used during 2FA verification. */
    return this.tempTokenSig();
  }

  // PUBLIC_INTERFACE
  isAuthenticated(): boolean {
    /** Indicates whether a final JWT is present. */
    return !!this.tokenSig();
  }

  // PUBLIC_INTERFACE
  logout() {
    /** Clears tokens. */
    this.setToken(null);
    this.setTempToken(null);
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
