import { describe, expect, it } from 'vitest';

import type { ProductVariant } from './types';
import { colorSuggestionOf, generateVariants, normalizeColor, summarizeVariants, variantsOutsideGrid } from './variants';

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

describe('generateVariants', () => {
  it('crosses each color with each size, at the base price and with no stock', () => {
    expect(generateVariants(['P', 'M'], ['preto', 'branco'], 14990, [])).toEqual([
      { size: 'P', color: 'preto', sku: '', priceInCents: 14990, stock: 0, active: true },
      { size: 'M', color: 'preto', sku: '', priceInCents: 14990, stock: 0, active: true },
      { size: 'P', color: 'branco', sku: '', priceInCents: 14990, stock: 0, active: true },
      { size: 'M', color: 'branco', sku: '', priceInCents: 14990, stock: 0, active: true },
    ]);
  });

  it('uses an empty color when none was chosen', () => {
    expect(generateVariants(['U'], [], 5990, []).map(({ size, color }) => ({ size, color }))).toEqual([{ size: 'U', color: '' }]);
  });

  it('skips the combinations the list already has', () => {
    const existing = [{ size: 'P', color: 'preto' }];

    expect(generateVariants(['P', 'M'], ['preto'], 100, existing).map(({ size }) => size)).toEqual(['M']);
  });
});

describe('normalizeColor', () => {
  it('stores the color the way the API keeps it', () => {
    expect(normalizeColor('  Cinza Mescla ')).toBe('cinza mescla');
  });
});

describe('variantsOutsideGrid', () => {
  it('points to the rows whose size the grid does not have', () => {
    expect(variantsOutsideGrid([{ size: '38' }, { size: 'M' }, { size: '40' }], 'apparel')).toEqual([0, 2]);
    expect(variantsOutsideGrid([{ size: '38' }], 'num')).toEqual([]);
  });
});

describe('summarizeVariants with a cleared stock field', () => {
  it('counts a NaN stock as zero instead of printing NaN', () => {
    const summary = summarizeVariants([{ active: true, stock: Number.NaN, priceInCents: 100 }, { active: true, stock: 4, priceInCents: 100 }]);

    expect(summary.totalStock).toBe(4);
    expect(summary.outOfStockCount).toBe(1);
  });
});
