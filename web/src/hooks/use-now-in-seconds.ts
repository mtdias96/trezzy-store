import { useSyncExternalStore } from 'react';

function subscribeToNothing(): () => void {
  return () => {};
}

// Agenda o próximo tique na virada do segundo: com um setInterval de 1 s, o atraso acumula e o relógio pula um número.
function subscribeToSeconds(onTick: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>;

  const schedule = () => {
    timer = setTimeout(() => {
      onTick();
      schedule();
    }, 1000 - (Date.now() % 1000));
  };

  schedule();

  return () => clearTimeout(timer);
}

function readSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function readOnServer(): null {
  return null;
}

// Só atualiza enquanto `active`. null no servidor e na hidratação, que não podem ler a hora.
export function useNowInSeconds(active: boolean): number | null {
  return useSyncExternalStore<number | null>(active ? subscribeToSeconds : subscribeToNothing, readSeconds, readOnServer);
}
