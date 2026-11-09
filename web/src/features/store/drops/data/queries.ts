import 'server-only';

import type { Route } from 'next';
import { cacheLife, cacheTag } from 'next/cache';

import {
  DROP_CALENDAR_LIMIT,
  dropCaption,
  dropLongLabel,
  dropNumberLabel,
  dropShortLabel,
  dropStockLabel,
  dropSubtitle,
} from '@/features/store/drops/model/drop';
import type { CalendarDrop, Drop, LiveDropStock } from '@/features/store/drops/model/types';
import { formatWeekdayDateHour } from '@/lib/date';
import { isRequestFailure } from '@/lib/http';

import type { CalendarDropDto, DropDto } from './api';
import { fetchDropCalendar, fetchNextDrop } from './api';

function toDrop({ number, brand, title, description, startsAt, imageUrl, imageAlt, sticker }: DropDto): Drop {
  const date = new Date(startsAt);

  return {
    number,
    brand,
    title,
    description,
    startsAt,
    imageUrl,
    imageAlt,
    sticker,
    shortLabel: dropShortLabel(number, date),
    longLabel: dropLongLabel(number, date),
    caption: dropCaption(brand, number),
  };
}

export async function getNextDrop(): Promise<Drop | null> {
  'use cache';
  cacheTag('drops');

  try {
    const drop = await fetchNextDrop();

    cacheLife('hours');

    return drop && toDrop(drop);
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    cacheLife('minutes');

    return null;
  }
}

function toCalendarDrop(drop: CalendarDropDto): CalendarDrop {
  return {
    number: drop.number,
    numberLabel: dropNumberLabel(drop.number),
    dateLabel: formatWeekdayDateHour(new Date(drop.startsAt)),
    title: drop.title,
    subtitle: dropSubtitle(drop.brand, drop.priceInCents, drop.priceIsFrom),
    imageUrl: drop.imageUrl,
    href: drop.href as Route,
    status: drop.status,
    stockLabel: dropStockLabel(drop),
  };
}

// Horas, como o resto da home: a página fica com o menor tempo entre as partes. O estoque vivo vem do getLiveDropStock.
export async function getDropCalendar(): Promise<CalendarDrop[]> {
  'use cache';
  cacheTag('drops');

  try {
    const drops = await fetchDropCalendar(DROP_CALENDAR_LIMIT);

    cacheLife('hours');

    return drops.map(toCalendarDrop);
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    cacheLife('minutes');

    return [];
  }
}

function toLiveDropStock(drop: CalendarDropDto): LiveDropStock {
  return { number: drop.number, status: drop.status, stockLabel: dropStockLabel(drop) };
}

// Minutos, e não horas: o "Restam 38" e o esgotado mudam com os pedidos, fora de qualquer action do Next.
export async function getLiveDropStock(): Promise<LiveDropStock[]> {
  'use cache';
  cacheTag('drops');
  cacheLife('minutes');

  try {
    const drops = await fetchDropCalendar(DROP_CALENDAR_LIMIT);

    return drops.map(toLiveDropStock);
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    return [];
  }
}
