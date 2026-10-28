import { describe, expect, it } from 'vitest';

import { discountPercent, formatAmount, formatPrice, formatWholeAmount, parsePriceInput } from './money';

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

describe('formatAmount', () => {
  it.each([
    [1, '0,01'],
    [123, '1,23'],
    [999999999, '9.999.999,99'],
  ])('formats %i cents as %s, without the currency', (cents, amount) => {
    expect(formatAmount(cents)).toBe(amount);
  });
});

describe('formatWholeAmount', () => {
  it('drops the cents and keeps the thousands dot', () => {
    expect([formatWholeAmount(30000), formatWholeAmount(120000), formatWholeAmount(29990)]).toEqual(['300', '1.200', '299']);
  });
});

describe('parsePriceInput', () => {
  it.each([
    ['1', 1],
    ['0,012', 12],
    ['0,123', 123],
    ['1,234', 1234],
  ])('pushes the comma as digits are typed: %s is %i cents', (text, cents) => {
    expect(parsePriceInput(text)).toBe(cents);
  });

  it('moves the comma back when a digit is erased', () => {
    expect(parsePriceInput('1,2')).toBe(12);
  });

  it.each(['', '0,0', 'abc'])('reads %j as zero', (text) => {
    expect(parsePriceInput(text)).toBe(0);
  });

  it('drops letters, signs and separators', () => {
    expect(parsePriceInput('-R$ 1.299,90a')).toBe(129990);
  });

  it('refuses more digits than the field holds', () => {
    expect(parsePriceInput('9.999.999,990')).toBeNull();
  });

  it('ignores leading zeros when counting digits', () => {
    expect(parsePriceInput('0.999.999.999')).toBe(999999999);
  });
});

describe('discountPercent', () => {
  it.each([
    [58990, 48990, 17],
    [119990, 107991, 10],
    [32490, 25990, 20],
  ])('from %i to %i cents is %i%%', (from, to, percent) => {
    expect(discountPercent(from, to)).toBe(percent);
  });

  it('is zero when the price did not drop', () => {
    expect(discountPercent(48990, 48990)).toBe(0);
    expect(discountPercent(48990, 58990)).toBe(0);
  });
});
