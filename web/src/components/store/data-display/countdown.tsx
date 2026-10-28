'use client';

import { useRef } from 'react';

import { useCountdown } from '@/hooks/use-countdown';
import { formatCountdown } from '@/lib/countdown';

type CountdownProps = {
  endsAt: string;
};

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
