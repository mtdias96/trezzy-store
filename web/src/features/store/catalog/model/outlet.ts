import { discountPercent } from '@/lib/money';
import { pendingRoute } from '@/lib/route';

import type { OutletProduct, OutletShowcase } from './types';

export const OUTLET_HREF = pendingRoute('/outlet');

export const OUTLET_TILES = 4;

export type OutletCandidate = Omit<OutletProduct, 'compareAtPriceInCents'> & {
  compareAtPriceInCents: number | null;
};

function isOnSale(product: OutletCandidate): product is OutletProduct {
  return product.compareAtPriceInCents !== null && product.compareAtPriceInCents > product.priceInCents;
}

// O mosaico é desenhado para quatro peças: com menos, a seção some em vez de abrir buraco na grade.
export function toOutletShowcase(candidates: readonly OutletCandidate[]): OutletShowcase | null {
  const products = candidates.filter(isOnSale).slice(0, OUTLET_TILES);

  if (products.length < OUTLET_TILES) {
    return null;
  }

  return {
    products,
    topDiscountPercent: Math.max(...products.map((product) => discountPercent(product.compareAtPriceInCents, product.priceInCents))),
  };
}
