import { describe, expect, it } from 'vitest';

import { formatCountdown, toCountdown } from './countdown';

const ms = ({ days = 0, hours = 0, minutes = 0, seconds = 0 }) =>
  (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;

describe('toCountdown', () => {
  it('splits the remaining time into days, hours, minutes and seconds', () => {
    expect(toCountdown(ms({ days: 3, hours: 5, minutes: 46, seconds: 50 }))).toEqual({
      days: 3,
      hours: 5,
      minutes: 46,
      seconds: 50,
    });
  });

  it('drops the milliseconds instead of rounding up', () => {
    expect(toCountdown(ms({ seconds: 10 }) + 999).seconds).toBe(10);
  });

  it('stops at zero when the deadline has passed', () => {
    expect(toCountdown(-ms({ minutes: 5 }))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe('formatCountdown', () => {
  it('pads every part to two digits', () => {
    expect(formatCountdown({ days: 3, hours: 5, minutes: 46, seconds: 0 })).toBe('03d 05:46:00');
  });

  it('keeps more than 99 days whole', () => {
    expect(formatCountdown({ days: 120, hours: 0, minutes: 0, seconds: 0 })).toBe('120d 00:00:00');
  });
});
