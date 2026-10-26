import { describe, expect, it, vi } from 'vitest';

import type { GetDashboardUseCase } from '@application/useCases/dashboard/GetDashboardUseCase';

import { GetDashboardController } from './GetDashboardController';

describe('GetDashboardController', () => {
  it('returns the dashboard overview', async () => {
    const getDashboardUseCase = {
      execute: vi.fn<GetDashboardUseCase['execute']>().mockResolvedValue({ accounts: { total: 3 } }),
    };
    const sut = new GetDashboardController(getDashboardUseCase as unknown as GetDashboardUseCase);

    const response = await sut.execute({
      body: undefined,
      params: {},
      queryParams: {},
      accountId: 'admin-1',
      permissions: ['dashboard:access'],
    });

    expect(response).toEqual({ statusCode: 200, body: { accounts: { total: 3 } } });
  });
});
