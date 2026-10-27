import { describe, expect, it } from 'vitest';

import { formatPrice } from './money';

describe('formatPrice', () => {
  // O Intl separa o "R$" do valor com um espaço inseparável (U+00A0).
  it.each([
    [196987, 'R$ 1.969,87'],
    [26999, 'R$ 269,99'],
    [0, 'R$ 0,00'],
  ])('formats %i cents as %s', (cents, price) => {
    expect(formatPrice(cents)).toBe(price);
  });
});
