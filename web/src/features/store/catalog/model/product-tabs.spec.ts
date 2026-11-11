import { describe, expect, it } from 'vitest';

import { toProductTabs } from './product-tabs';
import type { ProductSummary } from './types';

const product = (id: string): ProductSummary => ({
  id,
  name: id,
  brand: 'Pátio 9',
  href: '/',
  imageUrl: null,
  hoverImageUrl: null,
  priceInCents: 10000,
  compareAtPriceInCents: null,
  installments: null,
  pixPriceInCents: null,
  rating: null,
  sizeOptions: [],
});

describe('toProductTabs', () => {
  it('puts "Tudo" first and the departments after, in order', () => {
    const result = toProductTabs(3, [product('a'), product('b')], [
      { slug: 'streetwear', name: 'Streetwear', products: [product('a')] },
      { slug: 'sneakers', name: 'Sneakers', products: [product('b')] },
    ]);

    expect(result.tabs.map(({ id, label }) => [id, label])).toEqual([
      ['all', 'Tudo'],
      ['streetwear', 'Streetwear'],
      ['sneakers', 'Sneakers'],
    ]);
    expect(result.total).toBe(3);
  });

  it('drops tabs without products', () => {
    const result = toProductTabs(1, [product('a')], [{ slug: 'eyewear', name: 'Eyewear', products: [] }]);

    expect(result.tabs.map(({ id }) => id)).toEqual(['all']);
  });
});
