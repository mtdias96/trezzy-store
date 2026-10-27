import { describe, expect, it } from 'vitest';

import { matchesSearch } from './text';

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
