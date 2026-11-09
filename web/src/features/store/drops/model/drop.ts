import { formatLongWeekdayHour, formatWeekdayHour } from '@/lib/date';
import { formatPrice } from '@/lib/money';
import { pendingRoute } from '@/lib/route';
import { twoDigits } from '@/lib/text';

import type { CalendarDrop, DropStock, LiveDropStock } from './types';

export const DROPS_HREF = pendingRoute('/drops');

export const DROP_CALENDAR_LIMIT = 4;

export const LIVE_DROP_STOCK_PATH = '/api/drops/stock';

export function withLiveStock(drops: readonly CalendarDrop[], stock: readonly LiveDropStock[]): readonly CalendarDrop[] {
  return drops.map((drop) => {
    const live = stock.find(({ number }) => number === drop.number);

    return live ? { ...drop, status: live.status, stockLabel: live.stockLabel } : drop;
  });
}

const UNIT_NAMES = {
  pair: ['par', 'pares'],
  piece: ['peça', 'peças'],
} satisfies Record<'pair' | 'piece', [string, string]>;

export function dropStockLabel(stock: DropStock): string {
  if (stock.status === 'upcoming') {
    const [one, many] = UNIT_NAMES[stock.unit];

    return `${stock.quantity} ${stock.quantity === 1 ? one : many}`;
  }

  if (stock.status === 'available') {
    return stock.remaining === 1 ? 'Resta 1' : `Restam ${stock.remaining}`;
  }

  const minutes = stock.soldOutAfterMinutes;

  return minutes < 60 ? `Esgotou em ${minutes} min` : `Esgotou em ${Math.round(minutes / 60)} h`;
}

export function dropSubtitle(brand: string, priceInCents: number, priceIsFrom: boolean): string {
  return `${brand} · ${priceIsFrom ? 'A partir de ' : ''}${formatPrice(priceInCents)}`;
}

export function dropNumberLabel(number: number): string {
  return `Drop ${twoDigits(number)}`;
}

export function dropShortLabel(number: number, startsAt: Date): string {
  return `Drop ${twoDigits(number)} · ${formatWeekdayHour(startsAt)}`;
}

export function dropLongLabel(number: number, startsAt: Date): string {
  return `Drop ${twoDigits(number)} · ${formatLongWeekdayHour(startsAt)}`;
}

export function dropCaption(brand: string, number: number): string {
  return `${brand} · Nº${twoDigits(number)} · Edição limitada`;
}

export function dropReminderKey(number: number): string {
  return `drop-reminder:${number}`;
}
