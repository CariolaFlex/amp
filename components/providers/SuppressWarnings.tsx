'use client';

import { useEffect } from 'react';

// Suppresses known dev-only React 19 / cmdk script-tag warning
// This is cosmetic only — no production impact
export function SuppressWarnings() {
  useEffect(() => {
    const orig = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (msg.includes('Encountered a script tag while rendering React component')) return;
      orig(...args);
    };
    return () => { console.error = orig; };
  }, []);
  return null;
}
