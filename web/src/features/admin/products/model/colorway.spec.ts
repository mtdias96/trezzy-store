import { describe, expect, it } from 'vitest';

import { colorCopyDefaults, colorwayOptions } from './colorway';
import type { ColorwayCandidate, ProductDetail } from './types';

const candidate = (id: string, title: string, colorName: string | null, overrides: Partial<ColorwayCandidate> = {}): ColorwayCandidate => ({
  id,
  title,
  colorName,
  brandId: 'vans',
  categoryId: 'tenis',
  ...overrides,
});

describe('colorwayOptions', () => {
  const candidates = [
    candidate('p-grey', 'Old Skool Grey', '2 Tone Grey'),
    candidate('p-self', 'Old Skool Black', 'Reflective Black'),
    candidate('p-new', 'Authentic', null),
    candidate('p-lost', 'Camiseta', 'Branco', { brandId: 'lost' }),
    candidate('p-cap', 'Boné', 'Preto', { categoryId: 'bones' }),
  ];

  it('offers the products of the same brand and category, without the product itself, by title', () => {
    expect(colorwayOptions(candidates, { brandId: 'vans', categoryId: 'tenis', productId: 'p-self' })).toEqual([
      { value: 'p-new', label: 'Authentic (sem nome de cor)', disabled: true },
      { value: 'p-grey', label: 'Old Skool Grey · 2 Tone Grey', disabled: false },
    ]);
  });
});

describe('colorCopyDefaults', () => {
  it('copies what the colors share, linked to the origin, and leaves the size grid to be generated', () => {
    const source = {
      id: 'p-grey',
      title: 'Old Skool',
      description: 'Lona e camurça.',
      status: 'active',
      brandId: 'vans',
      categoryId: 'tenis',
      sizeGrid: 'num',
      colorName: '2 Tone Grey',
      colorways: [],
      media: [{ id: 'm-1', url: 'https://cdn.test/uploads/m-1.webp' }],
      variants: [
        { id: 'v-40', size: '40', color: 'cinza', sku: 'OLD-40', priceInCents: 58_700, stock: 3, active: true },
        { id: 'v-41', size: '41', color: 'cinza', sku: 'OLD-41', priceInCents: 59_900, stock: 0, active: false },
      ],
      updatedAt: '2026-11-14T12:00:00.000Z',
    } satisfies ProductDetail;

    expect(colorCopyDefaults(source)).toEqual({
      title: 'Old Skool',
      description: 'Lona e camurça.',
      active: true,
      brandId: 'vans',
      categoryId: 'tenis',
      colorName: '',
      familyOf: 'p-grey',
      basePriceInCents: 58_700,
      variants: [],
    });
  });
});
