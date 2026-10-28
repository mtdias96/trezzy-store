import { describe, expect, it } from 'vitest';

import { longestWordLength, matchesSearch, twoDigits, words } from './text';

describe('matchesSearch', () => {
  it('ignores accents and case', () => {
    expect(matchesSearch('Tênis Gazelle', 'TENIS')).toBe(true);
  });

  it('finds every word anywhere in the text', () => {
    expect(matchesSearch('Dunk Low Pro "Black/White"', 'white dunk')).toBe(true);
  });

  it('fails when one word is missing', () => {
    expect(matchesSearch('Dunk Low Pro', 'dunk high')).toBe(false);
  });

  it('matches everything for an empty query', () => {
    expect(matchesSearch('Dunk Low Pro', '   ')).toBe(true);
  });
});

describe('words', () => {
  it('splits on any whitespace and drops empty parts', () => {
    expect(words('  Runner 03\nLima   Ácida ')).toEqual(['Runner', '03', 'Lima', 'Ácida']);
  });
});

describe('longestWordLength', () => {
  it('counts the letters of the longest word', () => {
    expect(longestWordLength('Runner 03 Lima Ácida')).toBe(6);
  });

  it('is zero for an empty text', () => {
    expect(longestWordLength('   ')).toBe(0);
  });
});

describe('twoDigits', () => {
  it.each([
    [7, '07'],
    [0, '00'],
    [42, '42'],
    [120, '120'],
  ])('formats %i as %s', (value, text) => {
    expect(twoDigits(value)).toBe(text);
  });
});
