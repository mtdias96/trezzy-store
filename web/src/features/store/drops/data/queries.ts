import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { dropLongLabel, dropShortLabel } from '@/features/store/drops/model/drop';
import type { Drop } from '@/features/store/drops/model/types';
import { isRequestFailure } from '@/lib/http';

import type { DropDto } from './api';
// PRÉVIA (não commitar): o drop de exemplo no lugar da rota.
import { fetchNextDrop } from './preview-api';

function toDrop({ number, title, description, startsAt, imageUrl, imageAlt, sticker }: DropDto): Drop {
  const date = new Date(startsAt);

  return {
    number,
    title,
    description,
    startsAt,
    imageUrl,
    imageAlt,
    sticker,
    shortLabel: dropShortLabel(number, date),
    longLabel: dropLongLabel(number, date),
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
