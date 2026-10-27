import { useSyncExternalStore } from 'react';

function subscribeToNothing(): () => void {
  return () => {};
}

// Valor que só o browser sabe (hora, sistema). O servidor e a hidratação usam o fallback, sem ler a hora no
// prerender, e o browser troca pelo valor logo depois. O `read` devolve primitivo: o React compara a cada render.
export function useClientValue<T extends string | number | boolean | null>(read: () => T, fallback: T): T {
  return useSyncExternalStore(subscribeToNothing, read, () => fallback);
}
