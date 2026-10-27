import { describe, expect, it } from 'vitest';

import type { ProductVariant } from './types';
import { colorSuggestionOf, summarizeVariants } from './variants';

function variant(stock: number, priceInCents = 10000, active = true): ProductVariant {
  return { id: `v${stock}-${priceInCents}`, size: 'M', color: 'preto', sku: 'SKU', priceInCents, stock, active };
}

describe('summarizeVariants', () => {
  it('counts variants, stock and the price range', () => {
    expect(summarizeVariants([variant(10, 74990), variant(5, 78990), variant(0, 74990)])).toEqual({
      count: 3,
      activeCount: 3,
      totalStock: 15,
      outOfStockCount: 1,
      stockLevel: 'low',
      minPriceInCents: 74990,
      maxPriceInCents: 78990,
    });
  });

  it('flags low stock when one active variant has 3 units or fewer, whatever the total', () => {
    expect(summarizeVariants([variant(50), variant(3)]).stockLevel).toBe('low');
  });

  it('keeps a single variant with 4 units in stock', () => {
    expect(summarizeVariants([variant(4)]).stockLevel).toBe('in-stock');
  });

  it('is out of stock when the active variants have nothing left', () => {
    expect(summarizeVariants([variant(0), variant(8, 10000, false)]).stockLevel).toBe('out');
  });

  it('ignores inactive variants for the price and the stock level', () => {
    const summary = summarizeVariants([variant(10, 50000), variant(1, 99000, false)]);

    expect(summary).toMatchObject({ activeCount: 1, stockLevel: 'in-stock', minPriceInCents: 50000, maxPriceInCents: 50000 });
  });

  it('has no price without variants', () => {
    expect(summarizeVariants([])).toMatchObject({ count: 0, stockLevel: 'out', minPriceInCents: null });
  });
});

describe('colorSuggestionOf', () => {
  it('finds the swatch by the lowercase color the API stores', () => {
    expect(colorSuggestionOf('cinza mescla')?.swatch).toBe('heather-gray');
  });

  it('has no swatch for a color outside the suggestions', () => {
    expect(colorSuggestionOf('roxo')).toBeUndefined();
  });
});
