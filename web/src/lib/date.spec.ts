import { describe, expect, it } from 'vitest';

import { formatLongWeekdayHour, formatRelativeDate, formatShortDate, formatTimeAgo, formatWeekdayHour, greetingFor } from './date';

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

describe('formatWeekdayHour', () => {
  it('formats as capitalized short weekday and hour', () => {
    // 30/10/2026 é uma sexta.
    expect(formatWeekdayHour(storeTime(30, 19))).toBe('Sex 19h');
  });

  it('uses the store time, not UTC', () => {
    // 23h na loja já é sábado em UTC.
    expect(formatWeekdayHour(storeTime(30, 23))).toBe('Sex 23h');
  });
});

describe('formatLongWeekdayHour', () => {
  it.each([
    [30, 19, 'Sexta, 19h'],
    [31, 9, 'Sábado, 9h'],
    [25, 0, 'Domingo, 0h'],
  ])('formats day %i at %ih (store time) as %s', (day, hour, text) => {
    expect(formatLongWeekdayHour(storeTime(day, hour))).toBe(text);
  });
});

describe('formatTimeAgo', () => {
  const now = storeTime(28, 12);
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  it.each([
    [0, 'hoje'],
    [1, 'ontem'],
    [3, 'há 3 dias'],
    [7, 'há 1 semana'],
    [15, 'há 2 semanas'],
    [30, 'há 1 mês'],
    [150, 'há 5 meses'],
    [365, 'há 1 ano'],
    [800, 'há 2 anos'],
  ])('labels %i days ago as %s', (days, label) => {
    expect(formatTimeAgo(daysAgo(days), now)).toBe(label);
  });
});
