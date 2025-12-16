import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * Safe helpers for platform-aware global access to avoid SSR and linter errors.
 */

// PUBLIC_INTERFACE
export function isBrowser(): boolean {
  /** Returns true when running in the browser environment. */
  const platformId = inject(PLATFORM_ID);
  return isPlatformBrowser(platformId);
}

// PUBLIC_INTERFACE
export function getWindow<T = any>(): T | undefined {
  /** Returns window object if in browser, otherwise undefined. */
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).window) {
      return (globalThis as any).window as T;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

// PUBLIC_INTERFACE
export function getSessionStorage(): any | undefined {
  /** Returns sessionStorage if in browser, otherwise undefined. */
  try {
    const w = getWindow<any>();
    return w?.sessionStorage;
  } catch {
    return undefined;
  }
}
