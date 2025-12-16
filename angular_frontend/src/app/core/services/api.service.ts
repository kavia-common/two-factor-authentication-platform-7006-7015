import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../app.config';
import { Observable } from 'rxjs';

/**
 * Compute base path: when NG_APP_API_BASE is empty, fall back to relative path so
 * Angular dev proxy can forward /auth/* to the backend in development without CORS.
 */
function apiBaseOrRelative(explicit: string | null | undefined): string {
  const trimmed = (explicit || '').trim();
  if (!trimmed) return ''; // implies relative like '/auth/...'
  return trimmed.replace(/\/+$/, ''); // drop trailing slash
}

// PUBLIC_INTERFACE
export interface LoginResponse {
  requires2fa?: boolean;
  challengeId?: string; // challenge id when 2FA required
  token?: string; // final JWT if 2FA not required
  message?: string;
}

// PUBLIC_INTERFACE
export interface Verify2FAResponse {
  token: string;
  message?: string;
}

// PUBLIC_INTERFACE
export interface Resend2FAResponse {
  ok: boolean;
  message?: string;
}

/**
 * ApiService communicates with backend REST endpoints using base URL from NG_APP_API_BASE.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = apiBaseOrRelative(inject(API_BASE_URL));

  // PUBLIC_INTERFACE
  login(payload: { email: string; password: string }): Observable<LoginResponse> {
    /** Sends login request; backend decides if 2FA is required. */
    const base = this.baseUrl;
    const url = `${base}/auth/login`.replace(/^\/\//, '/');
    return this.http.post<LoginResponse>(url, payload);
  }

  // PUBLIC_INTERFACE
  verify2fa(payload: { challengeId: string; code: string }): Observable<Verify2FAResponse> {
    /** Verifies 2FA using challenge id and returns a final JWT. */
    const base = this.baseUrl;
    const url = `${base}/auth/2fa/verify`.replace(/^\/\//, '/');
    return this.http.post<Verify2FAResponse>(url, payload);
  }

  // PUBLIC_INTERFACE
  resend2fa(payload: { challengeId: string }): Observable<Resend2FAResponse> {
    /** Requests a resend/regeneration of the 2FA code for the given challenge. */
    const base = this.baseUrl;
    const url = `${base}/auth/2fa/resend`.replace(/^\/\//, '/');
    return this.http.post<Resend2FAResponse>(url, payload);
  }
}
