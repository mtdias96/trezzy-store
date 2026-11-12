import { describe, expect, it } from 'vitest';

import { mbToBytes } from './mbToBytes';

describe('mbToBytes', () => {
  it('converts binary megabytes (MiB) to bytes', () => {
    expect(mbToBytes(1)).toBe(1_048_576);
    expect(mbToBytes(10)).toBe(10_485_760);
  });
});
