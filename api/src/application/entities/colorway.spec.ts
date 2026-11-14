import { describe, expect, it } from 'vitest';

import { colorNameIssues, type ColorwayProduct, familyLinkIssues } from './colorway';

const target: ColorwayProduct = { id: 'p-grey', brandId: 'vans', categoryId: 'tenis', familyId: null, colorName: '2 Tone Grey' };
const product = { id: 'p-black', brandId: 'vans', categoryId: 'tenis' };
const fields = (issues: { field: string }[]) => issues.map(({ field }) => field);

describe('familyLinkIssues', () => {
  it('accepts a named product of the same brand and category', () => {
    expect(familyLinkIssues(product, target)).toEqual([]);
  });

  it.each([
    ['a missing product', null],
    ['the product itself', { ...target, id: 'p-black' }],
    ['another brand', { ...target, brandId: 'lost' }],
    ['another category', { ...target, categoryId: 'camisetas' }],
    ['a product without a color name', { ...target, colorName: null }],
  ])('rejects %s on familyOf', (_case, found) => {
    expect(fields(familyLinkIssues(product, found))).toEqual(['familyOf']);
  });
});

describe('colorNameIssues', () => {
  const siblings = [{ id: 'p-grey', colorName: '2 Tone Grey' }];

  it('asks nothing of a product outside a family', () => {
    expect(colorNameIssues(null, null)).toEqual([]);
  });

  it('requires a name in a family, different from the other colors in any case', () => {
    expect(fields(colorNameIssues(null, siblings))).toEqual(['colorName']);
    expect(fields(colorNameIssues('2 TONE GREY', siblings))).toEqual(['colorName']);
    expect(colorNameIssues('Reflective Black', siblings)).toEqual([]);
  });
});
