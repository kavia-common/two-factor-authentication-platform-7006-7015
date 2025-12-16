import { ApplicationConfig, InjectionToken, PLATFORM_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { env } from '../environments';
import { getWindow } from './core/utils/platform';

// PUBLIC_INTERFACE
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => env.getApiBase()
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: PLATFORM_ID, useValue: typeof globalThis !== 'undefined' ? (globalThis as any)['ngPlatformId'] ?? 'browser' : 'server' },
    { provide: API_BASE_URL, useFactory: () => env.getApiBase() }
  ]
};
