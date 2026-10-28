'use client';

import { useRef } from 'react';

import { useCountdown } from '@/hooks/use-countdown';
import { formatCountdown } from '@/lib/countdown';

type CountdownProps = {
  // ISO 8601 com fuso, como vem da API.
  endsAt: string;
};

// "03d 05:46:50" em uma linha. Herda a fonte do pai.
// tabular-nums: os dígitos têm a mesma largura, e o texto não muda de tamanho a cada segundo.
export function Countdown({ endsAt }: CountdownProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const countdown = useCountdown(endsAt, ref);

  return (
    <span ref={ref} role="timer" className="tabular-nums">
      {countdown ? formatCountdown(countdown) : '--d --:--:--'}
    </span>
  );
}
