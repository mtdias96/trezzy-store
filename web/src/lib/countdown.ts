import { twoDigits } from './text';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

// Prazo vencido fica em zero, e não negativo: a contagem para em 00d 00:00:00.
export function toCountdown(remainingMs: number): Countdown {
  const remaining = Math.max(0, remainingMs);

  return {
    days: Math.floor(remaining / DAY),
    hours: Math.floor((remaining % DAY) / HOUR),
    minutes: Math.floor((remaining % HOUR) / MINUTE),
    seconds: Math.floor((remaining % MINUTE) / SECOND),
  };
}

// "03d 05:46:50"
export function formatCountdown({ days, hours, minutes, seconds }: Countdown): string {
  return `${twoDigits(days)}d ${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`;
}
