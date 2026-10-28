import { formatLongWeekdayHour, formatWeekdayHour } from '@/lib/date';
import { pendingRoute } from '@/lib/route';
import { twoDigits } from '@/lib/text';

export const DROPS_HREF = pendingRoute('/drops');

// "Drop 07 · Sex 19h", com o dia e a hora da loja.
export function dropShortLabel(number: number, startsAt: Date): string {
  return `Drop ${twoDigits(number)} · ${formatWeekdayHour(startsAt)}`;
}

// "Drop 07 — Sexta, 19h"
export function dropLongLabel(number: number, startsAt: Date): string {
  return `Drop ${twoDigits(number)} — ${formatLongWeekdayHour(startsAt)}`;
}

// Chave do lembrete deste drop no navegador.
export function dropReminderKey(number: number): string {
  return `drop-reminder:${number}`;
}
