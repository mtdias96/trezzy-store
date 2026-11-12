import { describe, expect, it, vi } from 'vitest';

import type { ListBrandsUseCase } from '@application/useCases/brands/ListBrandsUseCase';

import { ListBrandsController } from './ListBrandsController';

const request = { body: undefined, params: {}, queryParams: {}, accountId: 'admin-1', permissions: ['products:read' as const] };

describe('ListBrandsController', () => {
  it('returns exactly the brands the use case gives', async () => {
    const brands = [{ id: 'b-1', name: 'Vans', active: true }];
    const listBrandsUseCase = { execute: vi.fn<ListBrandsUseCase['execute']>().mockResolvedValue({ brands }) };
    const sut = new ListBrandsController(listBrandsUseCase as unknown as ListBrandsUseCase);

    await expect(sut.execute(request)).resolves.toEqual({ statusCode: 200, body: { brands } });
  });
});
