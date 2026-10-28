import { useSyncExternalStore } from 'react';

// O evento 'storage' só chega às outras abas: este avisa a própria aba de que um valor mudou.
const CHANGE_EVENT = 'stored-flag-change';

// Sem localStorage (aba anônima do Safari, armazenamento bloqueado), o valor vive só nesta página.
const fallback = new Set<string>();

function subscribe(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function read(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return fallback.has(key);
  }
}

function write(key: string, value: boolean): void {
  try {
    if (value) {
      window.localStorage.setItem(key, '1');
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    if (value) {
      fallback.add(key);
    } else {
      fallback.delete(key);
    }
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Liga/desliga guardado neste navegador. false no servidor e na hidratação: o valor salvo aparece logo depois.
export function useStoredFlag(key: string): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(subscribe, () => read(key), () => false);

  return [value, (next) => write(key, next)];
}
