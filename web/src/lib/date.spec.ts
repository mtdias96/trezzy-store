import { describe, expect, it } from 'vitest';

import { formatRelativeDate, formatShortDate, greetingFor } from './date';

// Datas em UTC: São Paulo fica em UTC-3 (sem horário de verão desde 2019), então 15h UTC são 12h na loja.
const storeTime = (day: number, hour: number) => new Date(Date.UTC(2026, 9, day, hour + 3));

describe('greetingFor', () => {
  it.each([
    [5, 'Bom dia'],
    [11, 'Bom dia'],
    [12, 'Boa tarde'],
    [17, 'Boa tarde'],
    [18, 'Boa noite'],
    [0, 'Boa noite'],
    [4, 'Boa noite'],
  ])('greets %ih (store time) with %s', (hour, greeting) => {
    expect(greetingFor(storeTime(26, hour))).toBe(greeting);
  });
});

describe('formatShortDate', () => {
  it('formats as day, short month without the dot and year', () => {
    expect(formatShortDate(storeTime(25, 14))).toBe('25 out 2026');
  });

  it('uses the store day, not the UTC day', () => {
    // 22h na loja já é dia 26 em UTC.
    expect(formatShortDate(storeTime(25, 22))).toBe('25 out 2026');
  });

  it('keeps months whose short name has no dot', () => {
    expect(formatShortDate(new Date(Date.UTC(2026, 4, 1, 15)))).toBe('1 mai 2026');
  });
});

describe('formatRelativeDate', () => {
  const now = storeTime(26, 20);

  it.each([
    [new Date(now.getTime() - 30_000), 'agora'],
    [new Date(now.getTime() - 5 * 60_000), 'há 5 min'],
    [new Date(now.getTime() - 11 * 3_600_000), 'há 11 h'],
    [storeTime(24, 10), '24 out'],
  ])('describes %s as %s', (date, text) => {
    expect(formatRelativeDate(date, now)).toBe(text);
  });
});
