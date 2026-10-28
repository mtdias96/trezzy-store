import { describe, expect, it } from 'vitest';

import { formatRating } from './number';

describe('formatRating', () => {
  it.each([
    [4.6, '4,6'],
    [5, '5,0'],
    [4.66, '4,7'],
  ])('formats %d as %s', (value, text) => {
    expect(formatRating(value)).toBe(text);
  });
});
