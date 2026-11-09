import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('load', onChange);

  return () => window.removeEventListener('load', onChange);
}

// false no servidor e na hidratação. Numa navegação dentro do site, a página já carregou: responde true na hora.
export function useWindowLoaded(): boolean {
  return useSyncExternalStore(subscribe, () => document.readyState === 'complete', () => false);
}
