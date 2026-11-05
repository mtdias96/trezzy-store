import { useSyncExternalStore } from 'react';

// Inverso exato do md: (60rem no globals.css): abaixo dele, a sidebar vira um Sheet.
const MOBILE_QUERY = '(width < 60rem)';

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', onChange);

  return () => query.removeEventListener('change', onChange);
}

function isMobileViewport(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, isMobileViewport, () => false);
}
