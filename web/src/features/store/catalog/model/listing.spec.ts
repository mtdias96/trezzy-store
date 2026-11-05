import { describe, expect, it } from 'vitest';

import { activeFilterCount, currentPage, findPriceRange, pageCount, priceRanges, sizeFilterOptions, toggleValue } from './listing';

describe('toggleValue', () => {
  it('adds a missing value and removes a present one', () => {
    expect(toggleValue(['P'], 'M')).toEqual(['P', 'M']);
    expect(toggleValue(['P', 'M'], 'P')).toEqual(['M']);
  });
});

describe('activeFilterCount', () => {
  it('counts each size and brand chosen, plus the price range and the sale switch', () => {
    expect(activeFilterCount({ tamanho: ['P', 'M'], marca: ['kairo'], preco: '300-700', promocao: true })).toBe(5);
    expect(activeFilterCount({ tamanho: [], marca: [], preco: null, promocao: false })).toBe(0);
  });
});

describe('priceRanges', () => {
  it('builds the labels and the URL values from the limits alone', () => {
    expect(priceRanges([300, 700, 1200]).map(({ value, label }) => [value, label])).toEqual([
      ['ate-300', 'Até R$\u00A0300'],
      ['300-700', 'R$\u00A0300 – 700'],
      ['700-1200', 'R$\u00A0700 – 1.200'],
      ['acima-1200', 'Acima de R$\u00A01.200'],
    ]);
  });

  it('keeps the limits in cents, open at the ends', () => {
    expect(priceRanges([300, 700]).map(({ aboveInCents, upToInCents }) => [aboveInCents, upToInCents])).toEqual([
      [null, 30000],
      [30000, 70000],
      [70000, null],
    ]);
  });

  it('finds a range by its URL value', () => {
    expect(findPriceRange('700-1200')?.upToInCents).toBe(120000);
    expect(findPriceRange(null)).toBeUndefined();
  });
});

describe('pageCount and currentPage', () => {
  it('has at least one page, and rounds the last one up', () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(24)).toBe(1);
    expect(pageCount(25)).toBe(2);
  });

  it('turns an invalid page into the first one', () => {
    expect([currentPage(0), currentPage(-3), currentPage(1.5), currentPage(3)]).toEqual([1, 1, 1, 3]);
  });
});

describe('sizeFilterOptions', () => {
  it('keeps the API order and appends a chosen size that left the results, so it can be unchosen', () => {
    const facets = [{ value: 'M', count: 2 }, { value: 'G', count: 1 }];

    expect(sizeFilterOptions(facets, ['G', 'XG'])).toEqual(['M', 'G', 'XG']);
  });
});
