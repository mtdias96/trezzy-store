import { describe, expect, it } from 'vitest';

import { compareSizes, defaultColor, sizeOptions, storePricing } from './storefront';

const variant = (id: string, size: string, color: string, stock: number, active = true) => ({ id, size, color, stock, active });

describe('storePricing', () => {
  it('splits in 10 rounding the installment up and takes 10% off on Pix', () => {
    expect(storePricing(58_700)).toEqual({ installments: { count: 10, valueInCents: 5_870 }, pixPriceInCents: 52_830 });
    expect(storePricing(9_999)).toEqual({ installments: { count: 10, valueInCents: 1_000 }, pixPriceInCents: 8_999 });
  });
});

describe('defaultColor', () => {
  it('picks the first color with stock, skipping a sold-out one that sorts first', () => {
    const variants = [variant('a', 'M', 'azul', 0), variant('b', 'M', 'preto', 3)];

    expect(defaultColor('apparel', variants)).toBe('preto');
  });

  it('falls back to the first color when everything is sold out and ignores inactive variants', () => {
    const variants = [variant('a', 'M', 'azul', 5, false), variant('b', 'M', 'branco', 0), variant('c', 'M', 'preto', 0)];

    expect(defaultColor('apparel', variants)).toBe('branco');
  });

  it('returns null without an active variant', () => {
    expect(defaultColor('one', [variant('a', 'U', '', 1, false)])).toBeNull();
  });
});

describe('sizeOptions', () => {
  it('lists the sizes of the default color in grid order, with null for sold-out sizes', () => {
    const variants = [
      variant('g', 'G', 'preto', 2),
      variant('p', 'P', 'preto', 0),
      variant('m', 'M', 'preto', 1),
      variant('x', 'M', 'verde', 9),
      variant('i', 'GG', 'preto', 4, false),
    ];

    expect(sizeOptions('apparel', variants)).toEqual([
      { size: 'P', variantId: null },
      { size: 'M', variantId: 'm' },
      { size: 'G', variantId: 'g' },
    ]);
  });
});

describe('compareSizes', () => {
  it('orders numeric sizes, then apparel, then one size, and unknown sizes last', () => {
    expect(['U', 'XL', 'G', '42', 'PP', '38'].sort(compareSizes)).toEqual(['38', '42', 'PP', 'G', 'U', 'XL']);
  });
});
