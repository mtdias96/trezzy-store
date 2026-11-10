import { describe, expect, it } from 'vitest';

import { BRAND_TILES, brandHref, toBrandShowcase } from './brands';
import type { BrandTile } from './types';

const brands = (count: number): BrandTile[] => Array.from({ length: count }, (_, index) => ({
  slug: `marca-${index}`,
  name: `Marca ${index}`,
  productCount: 1,
  imageUrl: null,
  href: brandHref(`marca-${index}`),
}));

describe('brandHref', () => {
  it('opens the listing already filtered by the brand', () => {
    expect(brandHref('forte-athletics')).toBe('/produtos?marca=forte-athletics');
  });
});

describe('toBrandShowcase', () => {
  it('keeps the first eight brands, in the order received', () => {
    expect(toBrandShowcase(brands(10))?.map(({ slug }) => slug)).toEqual(brands(BRAND_TILES).map(({ slug }) => slug));
  });

  it('hides the section with fewer than eight brands', () => {
    expect(toBrandShowcase(brands(BRAND_TILES - 1))).toBeNull();
  });
});
