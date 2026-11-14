import { describe, expect, it } from 'vitest';

import { matchesSearch, paragraphs, twoDigits, words } from './text';

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

describe('paragraphs', () => {
  it('splits on blank lines, even with spaces in them, and drops empty paragraphs', () => {
    expect(paragraphs('Primeiro.\nAinda o primeiro.\n \nSegundo.\n\n\n')).toEqual(['Primeiro.\nAinda o primeiro.', 'Segundo.']);
  });
});

describe('words', () => {
  it('splits on any whitespace and drops empty parts', () => {
    expect(words('  Runner 03\nLima   Ácida ')).toEqual(['Runner', '03', 'Lima', 'Ácida']);
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
