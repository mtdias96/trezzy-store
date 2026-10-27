'use client';

import { useRef } from 'react';

import { useInView } from '@/hooks/use-in-view';
import { useNowInSeconds } from '@/hooks/use-now-in-seconds';
import { formatCountdown, toCountdown } from '@/lib/countdown';

type CountdownProps = {
  // ISO 8601 com fuso, como vem da API.
  endsAt: string;
};

// Só conta enquanto aparece na tela: escondido (painel do menu fechado, fora da rolagem), não re-renderiza.
// Herda a fonte do pai. tabular-nums: os dígitos têm a mesma largura, e o texto não muda de tamanho a cada segundo.
export function Countdown({ endsAt }: CountdownProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const now = useNowInSeconds(useInView(ref));

  return (
    <span ref={ref} role="timer" className="tabular-nums">
      {now === null ? '--d --:--:--' : formatCountdown(toCountdown(Date.parse(endsAt) - now * 1000))}
    </span>
  );
}
