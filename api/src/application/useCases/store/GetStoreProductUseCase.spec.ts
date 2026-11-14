import { describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@application/errors/ErrorCode';
import type { ProductRepository } from '@infra/database/repositories/ProductRepository';
import type { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

import { GetStoreProductUseCase } from './GetStoreProductUseCase';

const variant = (id: string, size: string, color: string, stock: number) => ({
  id,
  size,
  color,
  sku: `SKU-${id}`,
  priceInCents: 58_700,
  stock,
  active: true,
});

const detail: ProductRepository.StorefrontDetail = {
  id: 'p-1',
  slug: 'old-skool',
  title: 'Old Skool',
  description: 'Primeiro parágrafo.\n\nSegundo.',
  brandName: 'Vans',
  categorySlug: 'tenis',
  grid: 'num',
  familyId: null,
  colorName: null,
  priceInCents: 58_700,
  variants: [variant('b-41', '41', 'branco', 0), variant('p-40', '40', 'preto', 2), variant('b-38', '38', 'branco', 0)],
  mediaKeys: ['uploads/a.webp', 'uploads/b.webp'],
};

function makeSut(product: ProductRepository.StorefrontDetail | null, colorways: ProductRepository.StorefrontColorway[] = []) {
  const productRepository = {
    findStorefrontBySlug: vi.fn<ProductRepository['findStorefrontBySlug']>().mockResolvedValue(product),
    findStorefrontColorways: vi.fn<ProductRepository['findStorefrontColorways']>().mockResolvedValue(colorways),
  };
  const mediaStorageGateway = { getPublicUrl: (key: string) => `https://cdn.test/${key}` };

  return new GetStoreProductUseCase(
    productRepository as unknown as ProductRepository,
    mediaStorageGateway as unknown as MediaStorageGateway,
  );
}

describe('GetStoreProductUseCase', () => {
  it('returns the gallery, the pricing, the sizes in grid order and the variants by color, without the stock count', async () => {
    const sut = makeSut(detail);

    await expect(sut.execute({ slug: 'old-skool' })).resolves.toEqual({
      id: 'p-1',
      slug: 'old-skool',
      title: 'Old Skool',
      description: 'Primeiro parágrafo.\n\nSegundo.',
      brandName: 'Vans',
      categorySlug: 'tenis',
      priceInCents: 58_700,
      installments: { count: 10, valueInCents: 5_870 },
      pixPriceInCents: 52_830,
      imageUrls: ['https://cdn.test/uploads/a.webp', 'https://cdn.test/uploads/b.webp'],
      sizes: ['38', '40', '41'],
      variants: [
        { id: 'b-38', color: 'branco', size: '38', inStock: false },
        { id: 'b-41', color: 'branco', size: '41', inStock: false },
        { id: 'p-40', color: 'preto', size: '40', inStock: true },
      ],
      colorName: null,
      colorways: [],
    });
  });

  it('answers NOT_FOUND for a slug the store does not show', async () => {
    const sut = makeSut(null);

    await expect(sut.execute({ slug: 'rascunho' })).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });

  it('lists the colors of the model in alphabetical order, marking the current one', async () => {
    const sut = makeSut({ ...detail, familyId: 'family-1', colorName: 'Reflective Black' }, [
      { slug: 'old-skool', colorName: 'Reflective Black', coverKey: 'uploads/black.webp', inStock: true },
      { slug: 'old-skool-grey', colorName: '2 Tone Grey', coverKey: null, inStock: false },
    ]);

    const product = await sut.execute({ slug: 'old-skool' });

    expect(product.colorName).toBe('Reflective Black');
    expect(product.colorways).toEqual([
      { slug: 'old-skool-grey', colorName: '2 Tone Grey', coverUrl: null, inStock: false, current: false },
      { slug: 'old-skool', colorName: 'Reflective Black', coverUrl: 'https://cdn.test/uploads/black.webp', inStock: true, current: true },
    ]);
  });
});
