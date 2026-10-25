import { describe, expect, it, vi } from 'vitest';

import type { GetMeUseCase } from '@application/useCases/account/GetMeUseCase';

import { GetMeController } from './GetMeController';

describe('GetMeController', () => {
  it('loads the account from the authenticated accountId', async () => {
    const getMeUseCase = {
      execute: vi.fn<GetMeUseCase['execute']>().mockResolvedValue({ id: 'user-1', email: 'a@b.com' }),
    };
    const sut = new GetMeController(getMeUseCase as unknown as GetMeUseCase);

    const response = await sut.execute({ body: undefined, params: {}, queryParams: {}, accountId: 'user-1' });

    expect(response).toEqual({ statusCode: 200, body: { id: 'user-1', email: 'a@b.com' } });
    expect(getMeUseCase.execute).toHaveBeenCalledWith({ accountId: 'user-1' });
  });
});
