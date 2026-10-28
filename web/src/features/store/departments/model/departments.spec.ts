import { describe, expect, it } from 'vitest';

import { productCountLabel } from './departments';

describe('productCountLabel', () => {
  it.each([
    [0, '0 produtos'],
    [1, '1 produto'],
    [8, '8 produtos'],
  ])('labels %i as %s', (count, label) => {
    expect(productCountLabel(count)).toBe(label);
  });
});
