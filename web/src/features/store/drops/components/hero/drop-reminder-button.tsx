'use client';

import { useState } from 'react';
import { BellIcon, CheckIcon } from 'lucide-react';

import { useStoredFlag } from '@/hooks/use-stored-flag';

type DropReminderButtonProps = {
  storageKey: string;
};

// Classes inteiras por estado, sem cn: ele descartaria o text-body ao lado da cor do texto.
const stateClass = {
  idle: 'flex h-cta items-center justify-between gap-2 rounded-xl bg-lime px-4 text-body font-bold text-ink transition-colors duration-base hover:bg-lime-500',
  active: 'flex h-cta items-center justify-between gap-2 rounded-xl bg-gray-0 px-4 text-body font-bold text-ink transition-colors duration-base hover:bg-paper-stone',
} satisfies Record<'idle' | 'active', string>;

// O aviso de verdade (e-mail ou push) depende de uma rota na API: até lá, a escolha fica só neste navegador.
// O status sr-only só fala depois de um clique: o valor salvo entra após a hidratação, e anunciá-lo a cada visita
// seria ruído para o leitor de tela.
export function DropReminderButton({ storageKey }: DropReminderButtonProps) {
  const [active, setActive] = useStoredFlag(storageKey);
  const [announcement, setAnnouncement] = useState('');

  const toggle = () => {
    setActive(!active);
    setAnnouncement(active ? 'Lembrete desativado.' : 'Lembrete ativado.');
  };

  return (
    <>
      <button type="button" onClick={toggle} className={active ? stateClass.active : stateClass.idle}>
        <span className="flex items-center gap-1.5">
          {active ? 'Lembrete ativado' : 'Ativar lembrete'}
          {active ? <CheckIcon aria-hidden className="size-4" /> : null}
        </span>
        <BellIcon aria-hidden className="size-4.5" />
      </button>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
