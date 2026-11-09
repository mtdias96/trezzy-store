import { describe, expect, it } from 'vitest';

import { BEST_SELLERS_HREF, railPage, railPageCount, railPageLabel } from './best-sellers';

describe('BEST_SELLERS_HREF', () => {
  it('opens the catalog sorted by best sellers', () => {
    expect(BEST_SELLERS_HREF).toBe('/produtos?ordem=mais-vendidos');
  });
});

describe('railPageCount', () => {
  it.each([
    [10, 3],
    [8, 2],
    [4, 1],
    [1, 1],
    [0, 1],
  ])('splits %i products into %i pages of four', (products, pages) => {
    expect(railPageCount(products)).toBe(pages);
  });
});

describe('railPage', () => {
  const rail = { clientWidth: 1412, scrollWidth: 3530 };

  it('starts on the first page', () => {
    expect(railPage({ ...rail, scrollLeft: 0 }, 3)).toBe(0);
  });

  it('rounds to the nearest page while scrolling', () => {
    expect(railPage({ ...rail, scrollLeft: 600 }, 3)).toBe(0);
    expect(railPage({ ...rail, scrollLeft: 800 }, 3)).toBe(1);
  });

  it('counts the end of the rail as the last page, even when that page is short', () => {
    expect(railPage({ ...rail, scrollLeft: 2118 }, 3)).toBe(2);
  });

  it('stays on the only page of a rail that does not scroll', () => {
    expect(railPage({ clientWidth: 1412, scrollWidth: 1412, scrollLeft: 0 }, 1)).toBe(0);
  });

  it('never goes past the last page', () => {
    expect(railPage({ clientWidth: 300, scrollWidth: 1300, scrollLeft: 900 }, 3)).toBe(2);
  });
});

describe('railPageLabel', () => {
  it('pads both numbers', () => {
    expect(railPageLabel(0, 3)).toBe('01 / 03');
  });
});
