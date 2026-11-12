import { describe, expect, it } from 'vitest';

import { sortVariants } from './sizeGrids';

describe('sortVariants', () => {
  it('groups by color and follows the grid order inside each color', () => {
    const variants = [
      { size: 'G', color: 'preto' },
      { size: 'PP', color: 'preto' },
      { size: 'M', color: 'branco' },
      { size: 'P', color: 'preto' },
    ];

    expect(sortVariants('apparel', variants)).toEqual([
      { size: 'M', color: 'branco' },
      { size: 'PP', color: 'preto' },
      { size: 'P', color: 'preto' },
      { size: 'G', color: 'preto' },
    ]);
  });

  it('orders numeric sizes as numbers and sends sizes outside the grid to the end', () => {
    const variants = [{ size: '40', color: '' }, { size: 'XX', color: '' }, { size: '38', color: '' }];

    expect(sortVariants('num', variants).map(({ size }) => size)).toEqual(['38', '40', 'XX']);
  });

  it('does not change the original list', () => {
    const variants = [{ size: 'G', color: '' }, { size: 'P', color: '' }];

    sortVariants('apparel', variants);

    expect(variants.map(({ size }) => size)).toEqual(['G', 'P']);
  });
});
