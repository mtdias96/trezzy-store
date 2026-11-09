import { describe, expect, it } from 'vitest';

import { sizeLabel } from './size';

describe('sizeLabel', () => {
  it('names the one-size grid', () => {
    expect(sizeLabel('U')).toBe('Único');
  });

  it.each(['34', '46', 'PP', 'XGG'])('keeps %s as it is', (size) => {
    expect(sizeLabel(size)).toBe(size);
  });
});
