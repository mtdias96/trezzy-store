import { describe, expect, it } from 'vitest';

import { initialsFromEmail } from './initials';

describe('initialsFromEmail', () => {
  it.each([
    ['marina.costa@trezzy.com', 'MC'],
    ['marina_costa@trezzy.com', 'MC'],
    ['marina-costa+admin@trezzy.com', 'MC'],
    ['marina@trezzy.com', 'MA'],
    ['m@trezzy.com', 'M'],
  ])('%s → %s', (email, initials) => {
    expect(initialsFromEmail(email)).toBe(initials);
  });
});
