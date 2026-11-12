import { describe, expect, it, vi } from 'vitest';

import type { ListCategoriesUseCase } from '@application/useCases/categories/ListCategoriesUseCase';

import { ListCategoriesController } from './ListCategoriesController';

const request = { body: undefined, params: {}, queryParams: {}, accountId: 'admin-1', permissions: ['products:read' as const] };

describe('ListCategoriesController', () => {
  it('returns exactly the categories the use case gives, with the size grid', async () => {
    const categories = [{ id: 'c-1', name: 'Tênis', grid: 'num' as const, active: true }];
    const listCategoriesUseCase = { execute: vi.fn<ListCategoriesUseCase['execute']>().mockResolvedValue({ categories }) };
    const sut = new ListCategoriesController(listCategoriesUseCase as unknown as ListCategoriesUseCase);

    await expect(sut.execute(request)).resolves.toEqual({ statusCode: 200, body: { categories } });
  });
});
