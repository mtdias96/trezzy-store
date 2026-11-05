import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';
import type { CreateProductUseCase } from '@application/useCases/products/CreateProductUseCase';

import { CreateProductController } from './CreateProductController';

const BRAND_ID = '0d9c3c8e-2f1a-4b6e-9a7d-1c2b3a4d5e6f';
const CATEGORY_ID = '7a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';

function makeSut() {
  const createProductUseCase = {
    execute: vi.fn<CreateProductUseCase['execute']>().mockResolvedValue({ id: 'product-1' }),
  };
  const sut = new CreateProductController(createProductUseCase as unknown as CreateProductUseCase);

  return { sut, createProductUseCase };
}

const request = (body: unknown) => ({
  body,
  params: {},
  queryParams: {},
  accountId: 'admin-1',
  permissions: ['products:write' as const],
});

const body = {
  title: '  Camiseta Box Fit ',
  brandId: BRAND_ID,
  categoryId: CATEGORY_ID,
  variants: [{ size: ' m ', color: ' Preto ', sku: 'cam-m-pt', priceInCents: 18990 }],
};

const validationFields = async (promise: Promise<unknown>) => {
  const error = await promise.catch((reason: unknown) => reason);

  expect(error).toBeInstanceOf(ValidationError);

  return (error as ValidationError).issues.map(({ field }) => field);
};

describe('CreateProductController', () => {
  it('normalizes the body, applies defaults and returns the new id', async () => {
    const { sut, createProductUseCase } = makeSut();

    const response = await sut.execute(request(body));

    expect(response).toEqual({ statusCode: 201, body: { id: 'product-1' } });
    expect(createProductUseCase.execute).toHaveBeenCalledWith({
      title: 'Camiseta Box Fit',
      description: '',
      status: 'draft',
      brandId: BRAND_ID,
      categoryId: CATEGORY_ID,
      variants: [{ size: 'M', color: 'preto', sku: 'CAM-M-PT', priceInCents: 18990, stock: 0, active: true }],
    });
  });

  it('lets the SKU out, so the use case generates it', async () => {
    const { sut, createProductUseCase } = makeSut();
    const variant = { size: ' m ', color: ' Preto ', priceInCents: 18990 };

    await sut.execute(request({ ...body, variants: [variant, { ...variant, size: 'g' }] }));

    expect(createProductUseCase.execute.mock.calls[0]![0].variants.map(({ size, sku }) => ({ size, sku }))).toEqual([
      { size: 'M', sku: undefined },
      { size: 'G', sku: undefined },
    ]);
  });

  it('rejects repeated SKUs and size-color pairs in the same product', async () => {
    const { sut, createProductUseCase } = makeSut();
    const variant = body.variants[0]!;

    const fields = await validationFields(sut.execute(request({ ...body, variants: [variant, { ...variant }] })));

    expect(fields).toEqual(['variants.1.sku', 'variants.1.size']);
    expect(createProductUseCase.execute).not.toHaveBeenCalled();
  });

  it('rejects a product without variants or with a status set only after creation', async () => {
    const { sut, createProductUseCase } = makeSut();

    const fields = await validationFields(sut.execute(request({ ...body, status: 'archived', variants: [] })));

    expect(fields).toEqual(['status', 'variants']);
    expect(createProductUseCase.execute).not.toHaveBeenCalled();
  });

  it('rejects a title with no letter or number and a malformed SKU', async () => {
    const { sut } = makeSut();

    const fields = await validationFields(
      sut.execute(request({ ...body, title: '!!!', variants: [{ ...body.variants[0], sku: 'CAM--M' }] })),
    );

    expect(fields).toEqual(['title', 'variants.0.sku']);
  });
});
