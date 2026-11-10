import type { Route } from 'next';

import { formatWholeAmount } from '@/lib/money';

import type { PriceRange } from './listing';
import { serializeCatalogFilters } from './search-params';
import { ALL_PRODUCTS_HREF } from './taxonomy';
import type { PriceBand, PriceBandPhoto } from './types';

export const PRICE_BAND_PHOTOS = 3;

export type PriceBandResult = {
  range: PriceRange;
  total: number;
  photos: PriceBandPhoto[];
};

const money = (cents: number) => `R$ ${formatWholeAmount(cents)}`;

function wording({ aboveInCents, upToInCents }: PriceRange): Pick<PriceBand, 'caption' | 'amount'> {
  if (aboveInCents === null) {
    return { caption: 'Até', amount: money(upToInCents ?? 0) };
  }

  if (upToInCents === null) {
    return { caption: 'Acima de', amount: money(aboveInCents) };
  }

  return { caption: `De ${money(aboveInCents)} a`, amount: money(upToInCents) };
}

// Faixa sem produto fica de fora: o card levaria a uma listagem vazia.
export function toPriceBands(results: readonly PriceBandResult[]): PriceBand[] {
  return results
    .filter(({ total }) => total > 0)
    .map(({ range, total, photos }) => ({
      ...wording(range),
      href: serializeCatalogFilters(ALL_PRODUCTS_HREF, { preco: range.value }) as Route,
      productCount: total,
      photos: photos.slice(0, PRICE_BAND_PHOTOS),
    }));
}
