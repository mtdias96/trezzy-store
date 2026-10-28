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

// Conteúdo público, igual para todo visitante: entra no shell estático. O hero, o menu e a fita leem a mesma
// entrada. Com a API fora do ar, a home sai sem o drop, e a entrada vale minutos, para ele voltar logo.
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
