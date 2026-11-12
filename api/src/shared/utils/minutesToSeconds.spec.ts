import { describe, expect, it } from 'vitest';

import { minutesToSeconds } from './minutesToSeconds';

describe('minutesToSeconds', () => {
  it('converts minutes to seconds', () => {
    expect(minutesToSeconds(5)).toBe(300);
  });
});
