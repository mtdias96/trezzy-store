import { useCallback, useSyncExternalStore } from 'react';

// O servidor e a hidratação respondem false, e o browser troca pelo valor real logo depois.
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const list = window.matchMedia(query);

    list.addEventListener('change', onChange);

    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
