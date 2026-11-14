import { describe, expect, it, vi } from 'vitest';

import type { ListProductsUseCase } from '@application/useCases/products/ListProductsUseCase';

import { ListProductsController } from './ListProductsController';

const request = { body: undefined, params: {}, queryParams: {}, accountId: 'admin-1', permissions: ['products:read' as const] };

describe('ListProductsController', () => {
  it('returns the products with updatedAt as an ISO string', async () => {
    const listProductsUseCase = {
      execute: vi.fn<ListProductsUseCase['execute']>().mockResolvedValue({
        products: [{
          id: 'p-1',
          title: 'Camiseta',
          status: 'draft',
          brandId: 'b-1',
          categoryId: 'c-1',
          familyId: null,
          colorName: null,
          coverUrl: null,
          variants: [{ id: 'v-1', size: 'M', color: '', sku: 'CAM-M', priceInCents: 100, stock: 0, active: true }],
          updatedAt: new Date('2026-11-12T12:00:00Z'),
        }],
      }),
    };
    const sut = new ListProductsController(listProductsUseCase as unknown as ListProductsUseCase);

    const response = await sut.execute(request);

    expect(response).toEqual({
      statusCode: 200,
      body: {
        products: [{
          id: 'p-1',
          title: 'Camiseta',
          status: 'draft',
          brandId: 'b-1',
          categoryId: 'c-1',
          familyId: null,
          colorName: null,
          coverUrl: null,
          variants: [{ id: 'v-1', size: 'M', color: '', sku: 'CAM-M', priceInCents: 100, stock: 0, active: true }],
          updatedAt: '2026-11-12T12:00:00.000Z',
        }],
      },
    });
  });
});
