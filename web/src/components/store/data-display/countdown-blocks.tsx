'use client';

import { useRef } from 'react';

import { useCountdown } from '@/hooks/use-countdown';
import type { Countdown } from '@/lib/countdown';
import { twoDigits } from '@/lib/text';

type CountdownBlocksProps = {
  endsAt: string;
};

const UNITS = [
  ['days', 'Dias'],
  ['hours', 'Horas'],
  ['minutes', 'Min'],
  ['seconds', 'Seg'],
] as const satisfies readonly (readonly [keyof Countdown, string])[];

export function CountdownBlocks({ endsAt }: CountdownBlocksProps) {
  const ref = useRef<HTMLDivElement>(null);
  const countdown = useCountdown(endsAt, ref);

  return (
    <div ref={ref} role="timer" className="grid grid-cols-4 gap-2">
      {UNITS.map(([unit, label]) => (
        <div key={unit} className="flex flex-col gap-1.5 rounded-xl bg-brand-900 p-3 lg:px-4">
          <span className="font-display text-display-lg font-extrabold tabular-nums xl:text-display-xl">
            {countdown ? twoDigits(countdown[unit]) : '--'}
          </span>
          <span className="text-micro font-bold text-brand-300 uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
}
