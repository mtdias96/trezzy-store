import { describe, expect, it, vi } from 'vitest';

import type { ListStoreCategoriesUseCase } from '@application/useCases/store/ListStoreCategoriesUseCase';

import { ListStoreCategoriesController } from './ListStoreCategoriesController';

const request = { body: undefined, params: {}, queryParams: {}, accountId: null };

describe('ListStoreCategoriesController', () => {
  it('answers without an account and returns exactly the categories the use case gives', async () => {
    const categories = [{ slug: 'tenis', productCount: 2, coverUrl: 'https://cdn.test/uploads/cover.webp' }];
    const listStoreCategoriesUseCase = {
      execute: vi.fn<ListStoreCategoriesUseCase['execute']>().mockResolvedValue({ categories }),
    };
    const sut = new ListStoreCategoriesController(listStoreCategoriesUseCase as unknown as ListStoreCategoriesUseCase);

    await expect(sut.execute(request)).resolves.toEqual({ statusCode: 200, body: { categories } });
  });
});
