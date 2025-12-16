import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../app.config';
import { Observable } from 'rxjs';

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
  private baseUrl = inject(API_BASE_URL);

  // PUBLIC_INTERFACE
  login(payload: { email: string; password: string }): Observable<LoginResponse> {
    /** Sends login request; backend decides if 2FA is required. */
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  // PUBLIC_INTERFACE
  verify2fa(payload: { challengeId: string; code: string }): Observable<Verify2FAResponse> {
    /** Verifies 2FA using challenge id and returns a final JWT. */
    return this.http.post<Verify2FAResponse>(`${this.baseUrl}/auth/2fa/verify`, payload);
  }

  // PUBLIC_INTERFACE
  resend2fa(payload: { challengeId: string }): Observable<Resend2FAResponse> {
    /** Requests a resend/regeneration of the 2FA code for the given challenge. */
    return this.http.post<Resend2FAResponse>(`${this.baseUrl}/auth/2fa/resend`, payload);
  }
}
