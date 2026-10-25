import { describe, expect, it } from 'vitest';

import { Account } from './Account';

describe('Account', () => {
  it('generates its own id before being persisted', () => {
    const account = new Account({ email: 'a@b.com' });

    expect(account.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(account.externalId).toBeUndefined();
    expect(new Account({ email: 'a@b.com' }).id).not.toBe(account.id);
  });

  it('keeps the attributes it is rebuilt from', () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');

    expect(new Account({ id: 'acc-1', email: 'a@b.com', externalId: 'sub-1', createdAt })).toEqual({
      id: 'acc-1',
      email: 'a@b.com',
      externalId: 'sub-1',
      createdAt,
    });
  });
});
