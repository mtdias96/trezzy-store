import { describe, expect, it } from 'vitest';

import { formatAmount, formatPrice, parsePriceInput } from './money';

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
