declare global {
  // Augment global scope type without depending on plugin-specific rules
  interface Global {} // intentionally empty
}

// Helper to read values from globalThis safely
function readGlobalVar<T = any>(key: string): T | undefined {
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any)[key] !== undefined) {
      return (globalThis as any)[key] as T;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Load environment variables for Angular app.
 * Supports:
 * - Client-side via globalThis.NG_APP_* populated in index.html or runtime
 * - Build/SSR-time via process.env
 */
export const env = {
  // PUBLIC_INTERFACE
  getApiBase(): string {
    /** Returns API base URL for backend HTTP calls. */
    const fromGlobal = readGlobalVar<string>('NG_APP_API_BASE');
    if (fromGlobal && typeof fromGlobal === 'string' && fromGlobal.trim()) {
      return fromGlobal;
    }
    return (typeof process !== 'undefined' && (process as any).env?.NG_APP_API_BASE) || '';
  },

  // PUBLIC_INTERFACE
  getFrontendUrl(): string {
    /** Returns the frontend origin used for CORS configuration reference. */
    const fromGlobal = readGlobalVar<string>('NG_APP_FRONTEND_URL');
    if (fromGlobal && typeof fromGlobal === 'string' && fromGlobal.trim()) {
      return fromGlobal;
    }
    return (typeof process !== 'undefined' && (process as any).env?.NG_APP_FRONTEND_URL) || '';
  }
};
