import { describe, expect, it } from 'vitest';

import { fitLabel, ratingShares } from './reviews';

describe('ratingShares', () => {
  it('turns the counts into percentages, from 5 to 1 star', () => {
    expect(ratingShares({ distribution: [48, 9, 3, 1, 1], fit: null })).toEqual([
      { stars: 5, percent: 77 },
      { stars: 4, percent: 15 },
      { stars: 3, percent: 5 },
      { stars: 2, percent: 2 },
      { stars: 1, percent: 2 },
    ]);
  });

  it('is zero everywhere without reviews', () => {
    expect(ratingShares({ distribution: [0, 0, 0, 0, 0], fit: null }).every(({ percent }) => percent === 0)).toBe(true);
  });
});

describe('fitLabel', () => {
  it.each([
    ['small', 'Pequeno'],
    ['true-to-size', 'Normal'],
    ['large', 'Grande'],
  ] as const)('labels %s as %s', (fit, label) => {
    expect(fitLabel(fit)).toBe(label);
  });
});
