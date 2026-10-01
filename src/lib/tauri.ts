'use client';

/**
 * Utility to check if running inside a native desktop environment (Tauri)
 */
export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ||
    (window as unknown as { __TAURI__?: unknown }).__TAURI__
  );
}

/**
 * Helper to get platform context
 */
export function getRuntimePlatform(): 'desktop' | 'web' {
  return isTauriEnvironment() ? 'desktop' : 'web';
}
