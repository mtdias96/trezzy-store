import { describe, expect, it, vi } from 'vitest';

import type { AccountRepository } from '@infra/database/repositories/AccountRepository';

import { GetDashboardUseCase } from './GetDashboardUseCase';

describe('GetDashboardUseCase', () => {
  it('returns the overview with the total of accounts', async () => {
    const accountRepository = { count: vi.fn<AccountRepository['count']>().mockResolvedValue(42) };
    const sut = new GetDashboardUseCase(accountRepository as unknown as AccountRepository);

    await expect(sut.execute()).resolves.toEqual({ accounts: { total: 42 } });
  });
});
