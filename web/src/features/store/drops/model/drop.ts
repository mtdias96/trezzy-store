import { formatLongWeekdayHour, formatWeekdayHour } from '@/lib/date';
import { pendingRoute } from '@/lib/route';
import { twoDigits } from '@/lib/text';

export const DROPS_HREF = pendingRoute('/drops');

export function dropShortLabel(number: number, startsAt: Date): string {
  return `Drop ${twoDigits(number)} · ${formatWeekdayHour(startsAt)}`;
}

export function dropLongLabel(number: number, startsAt: Date): string {
  return `Drop ${twoDigits(number)} — ${formatLongWeekdayHour(startsAt)}`;
}

export function dropReminderKey(number: number): string {
  return `drop-reminder:${number}`;
}
