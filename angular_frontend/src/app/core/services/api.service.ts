import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../app.config';
import { Observable } from 'rxjs';

// PUBLIC_INTERFACE
export interface LoginResponse {
  requires2fa: boolean;
  tempToken?: string; // temporary token if 2FA required
  token?: string; // final JWT if 2FA not required
  message?: string;
}

// PUBLIC_INTERFACE
export interface Verify2FAResponse {
  token: string;
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
  verify2fa(payload: { code: string; tempToken: string }): Observable<Verify2FAResponse> {
    /** Verifies 2FA with a temp token and returns a final JWT. */
    return this.http.post<Verify2FAResponse>(`${this.baseUrl}/auth/verify-2fa`, payload);
  }
}
