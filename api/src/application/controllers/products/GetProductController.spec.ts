import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';
import type { GetProductUseCase } from '@application/useCases/products/GetProductUseCase';

import { GetProductController } from './GetProductController';

const PRODUCT_ID = '0d9c3c8e-2f1a-4b6e-9a7d-1c2b3a4d5e6f';

function makeSut() {
  const getProductUseCase = {
    execute: vi.fn<GetProductUseCase['execute']>().mockResolvedValue({
      id: PRODUCT_ID,
      title: 'Camiseta',
      description: '',
      status: 'active',
      brandId: 'b-1',
      categoryId: 'c-1',
      colorName: null,
      colorways: [],
      variants: [],
      media: [{ id: 'm-1', url: 'https://cdn.test/uploads/m-1.webp' }],
      updatedAt: new Date('2026-11-12T12:00:00Z'),
    }),
  };
  const sut = new GetProductController(getProductUseCase as unknown as GetProductUseCase);

  return { sut, getProductUseCase };
}

const request = (params: Record<string, unknown>) => ({
  body: undefined,
  params,
  queryParams: {},
  accountId: 'admin-1',
  permissions: ['products:read' as const],
});

describe('GetProductController', () => {
  it('returns the product from the path id', async () => {
    const { sut, getProductUseCase } = makeSut();

    const response = await sut.execute(request({ id: PRODUCT_ID }));

    expect(getProductUseCase.execute).toHaveBeenCalledWith({ productId: PRODUCT_ID });
    expect(response).toEqual({
      statusCode: 200,
      body: {
        product: {
          id: PRODUCT_ID,
          title: 'Camiseta',
          description: '',
          status: 'active',
          brandId: 'b-1',
          categoryId: 'c-1',
          colorName: null,
          colorways: [],
          variants: [],
          media: [{ id: 'm-1', url: 'https://cdn.test/uploads/m-1.webp' }],
          updatedAt: '2026-11-12T12:00:00.000Z',
        },
      },
    });
  });

  it('rejects an id that is not a UUID before reaching the use case', async () => {
    const { sut, getProductUseCase } = makeSut();

    await expect(sut.execute(request({ id: 'p-1' }))).rejects.toBeInstanceOf(ValidationError);
    expect(getProductUseCase.execute).not.toHaveBeenCalled();
  });
});
