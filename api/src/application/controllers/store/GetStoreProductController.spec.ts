import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';
import type { GetStoreProductUseCase } from '@application/useCases/store/GetStoreProductUseCase';

import { GetStoreProductController } from './GetStoreProductController';

const product: GetStoreProductUseCase.Output = {
  id: 'p-1',
  slug: 'old-skool',
  title: 'Old Skool',
  description: '',
  brandName: 'Vans',
  categorySlug: 'tenis',
  priceInCents: 58_700,
  installments: { count: 10, valueInCents: 5_870 },
  pixPriceInCents: 52_830,
  imageUrls: [],
  sizes: ['40'],
  variants: [{ id: 'v-1', color: '', size: '40', inStock: true }],
  colorName: null,
  colorways: [],
};

function makeSut() {
  const execute = vi.fn<GetStoreProductUseCase['execute']>().mockResolvedValue(product);
  const sut = new GetStoreProductController({ execute } as unknown as GetStoreProductUseCase);
  const request = (slug: string) => ({ body: undefined, params: { slug }, queryParams: {}, accountId: null });

  return { sut, execute, request };
}

describe('GetStoreProductController', () => {
  it('answers without an account with exactly the product the use case gives', async () => {
    const { sut, execute, request } = makeSut();

    await expect(sut.execute(request('old-skool'))).resolves.toEqual({ statusCode: 200, body: { product } });
    expect(execute).toHaveBeenCalledWith({ slug: 'old-skool' });
  });

  it('rejects a slug outside the URL format before calling the use case', async () => {
    const { sut, execute, request } = makeSut();

    await expect(sut.execute(request('Old Skool'))).rejects.toBeInstanceOf(ValidationError);
    expect(execute).not.toHaveBeenCalled();
  });
});
