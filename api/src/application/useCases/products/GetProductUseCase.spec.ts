import { describe, expect, it, vi } from 'vitest';

import type { Product } from '@application/entities/Product';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import type { ProductRepository } from '@infra/database/repositories/ProductRepository';
import type { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

import { GetProductUseCase } from './GetProductUseCase';

const variant = (size: string): Product.Variant => ({
  id: `v-${size}`,
  size,
  color: '',
  sku: `TEN-${size}`,
  priceInCents: 59990,
  stock: 2,
  active: true,
});

const detail: ProductRepository.Detail = {
  id: 'p-1',
  title: 'Tênis Dunk Low',
  description: 'Couro.',
  status: 'active',
  brandId: 'brand-1',
  categoryId: 'category-1',
  grid: 'num',
  familyId: null,
  colorName: null,
  updatedAt: new Date('2026-11-12T12:00:00Z'),
  variants: [variant('42'), variant('38')],
  media: [{ id: 'm-cover', key: 'uploads/m-cover.webp' }, { id: 'm-2', key: 'uploads/m-2.jpg' }],
};

function makeSut(product: ProductRepository.Detail | null) {
  const productRepository = {
    findDetailById: vi.fn<ProductRepository['findDetailById']>().mockResolvedValue(product),
    findFamilyMembers: vi.fn<ProductRepository['findFamilyMembers']>().mockResolvedValue([]),
  };
  const mediaStorageGateway = {
    getPublicUrl: vi.fn<MediaStorageGateway['getPublicUrl']>((key) => `https://cdn.test/${key}`),
  };
  const sut = new GetProductUseCase(
    productRepository as unknown as ProductRepository,
    mediaStorageGateway as unknown as MediaStorageGateway,
  );

  return { sut, productRepository };
}

describe('GetProductUseCase', () => {
  it('lists the other colors of the family with their cover, without the product itself', async () => {
    const { sut, productRepository } = makeSut({ ...detail, familyId: 'family-1', colorName: 'Reflective Black' });
    productRepository.findFamilyMembers.mockResolvedValue([
      { id: 'p-grey', title: 'Old Skool Grey', colorName: '2 Tone Grey', status: 'active', coverKey: 'uploads/grey.webp' },
      { id: 'p-1', title: 'Tênis Dunk Low', colorName: 'Reflective Black', status: 'active', coverKey: null },
    ]);

    const product = await sut.execute({ productId: 'p-1' });

    expect(product.colorName).toBe('Reflective Black');
    expect(product.colorways).toEqual([
      { id: 'p-grey', title: 'Old Skool Grey', colorName: '2 Tone Grey', status: 'active', coverUrl: 'https://cdn.test/uploads/grey.webp' },
    ]);
  });

  it('returns the gallery in order with CDN URLs and the variants sorted by the grid', async () => {
    const { sut, productRepository } = makeSut(detail);

    const product = await sut.execute({ productId: 'p-1' });

    expect(productRepository.findDetailById).toHaveBeenCalledWith('p-1');
    expect(product.media).toEqual([
      { id: 'm-cover', url: 'https://cdn.test/uploads/m-cover.webp' },
      { id: 'm-2', url: 'https://cdn.test/uploads/m-2.jpg' },
    ]);
    expect(product.variants.map(({ size }) => size)).toEqual(['38', '42']);
    expect(product).not.toHaveProperty('grid');
  });

  it('throws NOT_FOUND for an unknown product', async () => {
    const { sut } = makeSut(null);

    const error = await sut.execute({ productId: 'missing' }).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApplicationError);
    expect((error as ApplicationError).code).toBe(ErrorCode.NOT_FOUND);
  });
});
