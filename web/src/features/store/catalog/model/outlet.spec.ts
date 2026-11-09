import { describe, expect, it } from 'vitest';

import { type OutletCandidate, toOutletShowcase } from './outlet';

const candidate = (id: string, priceInCents: number, compareAtPriceInCents: number | null): OutletCandidate => ({
  id,
  name: id,
  categoryName: 'Moletons',
  href: '/',
  imageUrl: null,
  priceInCents,
  compareAtPriceInCents,
});

const fourOnSale = [
  candidate('a', 8000, 10000),
  candidate('b', 5000, 10000),
  candidate('c', 9000, 10000),
  candidate('d', 7500, 10000),
];

describe('toOutletShowcase', () => {
  it('reports the highest discount among the pieces', () => {
    expect(toOutletShowcase(fourOnSale)?.topDiscountPercent).toBe(50);
  });

  it('keeps only the four pieces of the mosaic', () => {
    const showcase = toOutletShowcase([...fourOnSale, candidate('e', 1000, 10000)]);

    expect(showcase?.products.map(({ id }) => id)).toEqual(['a', 'b', 'c', 'd']);
    expect(showcase?.topDiscountPercent).toBe(50);
  });

  it('skips products without a real discount', () => {
    const showcase = toOutletShowcase([candidate('x', 10000, null), candidate('y', 10000, 10000), ...fourOnSale]);

    expect(showcase?.products.map(({ id }) => id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('hides the section with fewer than four pieces', () => {
    expect(toOutletShowcase(fourOnSale.slice(0, 3))).toBeNull();
  });
});
