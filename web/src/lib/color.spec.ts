import { describe, expect, it } from 'vitest';

import { colorLabel, colorSuggestionOf } from './color';

describe('colorSuggestionOf', () => {
  it('finds the swatch by the color the API stores, in lowercase', () => {
    expect(colorSuggestionOf('cinza mescla')?.swatch).toBe('heather-gray');
  });

  it('has no swatch for a color outside the list', () => {
    expect(colorSuggestionOf('roxo')).toBeUndefined();
  });
});

describe('colorLabel', () => {
  it('uses the suggestion label and capitalizes any other color', () => {
    expect(colorLabel('cinza mescla')).toBe('Cinza mescla');
    expect(colorLabel('preto-verde')).toBe('Preto-verde');
    expect(colorLabel('')).toBe('');
  });
});
