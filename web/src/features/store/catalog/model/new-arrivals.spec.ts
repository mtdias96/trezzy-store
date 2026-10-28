import { describe, expect, it } from 'vitest';

import { toNewArrivals } from './new-arrivals';
import type { ProductSummary } from './types';

const product = (id: string): ProductSummary => ({
  id,
  name: id,
  brand: 'Pátio 9',
  href: '/',
  imageUrl: null,
  priceInCents: 10000,
  compareAtPriceInCents: null,
  installments: null,
  pixPriceInCents: null,
  rating: null,
  tag: null,
});

describe('toNewArrivals', () => {
  it('puts "Tudo" first and the departments after, in order', () => {
    const arrivals = toNewArrivals(3, [product('a'), product('b')], [
      { slug: 'streetwear', name: 'Streetwear', products: [product('a')] },
      { slug: 'sneakers', name: 'Sneakers', products: [product('b')] },
    ]);

    expect(arrivals.tabs.map(({ id, label }) => [id, label])).toEqual([
      ['all', 'Tudo'],
      ['streetwear', 'Streetwear'],
      ['sneakers', 'Sneakers'],
    ]);
    expect(arrivals.total).toBe(3);
  });

  it('drops tabs without products', () => {
    const arrivals = toNewArrivals(1, [product('a')], [{ slug: 'eyewear', name: 'Eyewear', products: [] }]);

    expect(arrivals.tabs.map(({ id }) => id)).toEqual(['all']);
  });
});
