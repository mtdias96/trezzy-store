import { describe, expect, it } from 'vitest';

import { CEP_PATTERN, formatCep } from './cep';

describe('formatCep', () => {
  it.each([
    ['01310100', '01310-100'],
    ['0131', '0131'],
    ['013101', '01310-1'],
    ['01310-100999', '01310-100'],
    ['ab01.310/100', '01310-100'],
  ])('formats %s as %s', (text, cep) => {
    expect(formatCep(text)).toBe(cep);
  });
});

describe('CEP_PATTERN', () => {
  it.each(['01310-100', '01310100'])('accepts %s', (cep) => {
    expect(CEP_PATTERN.test(cep)).toBe(true);
  });

  it.each(['0131-0100', '01310-10', 'abcde-fgh'])('refuses %s', (cep) => {
    expect(CEP_PATTERN.test(cep)).toBe(false);
  });
});
