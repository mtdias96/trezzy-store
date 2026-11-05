import { describe, expect, it } from 'vitest';

import { dropLongLabel, dropShortLabel } from './drop';

// 19h em São Paulo (UTC-3) de sexta, 30/10/2026.
const friday = new Date('2026-10-30T22:00:00Z');

describe('dropShortLabel', () => {
  it('pads the drop number and shows the short weekday and hour', () => {
    expect(dropShortLabel(7, friday)).toBe('Drop 07 · Sex 19h');
  });
});

describe('dropLongLabel', () => {
  it('pads the drop number and shows the long weekday and hour', () => {
    expect(dropLongLabel(7, friday)).toBe('Drop 07 — Sexta, 19h');
  });

  it('keeps numbers above 99 whole', () => {
    expect(dropLongLabel(120, friday)).toBe('Drop 120 — Sexta, 19h');
  });
});
