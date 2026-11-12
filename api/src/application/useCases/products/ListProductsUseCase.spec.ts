import { describe, expect, it, vi } from 'vitest';

import type { Product } from '@application/entities/Product';
import type { ProductRepository } from '@infra/database/repositories/ProductRepository';
import type { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

import { ListProductsUseCase } from './ListProductsUseCase';

const variant = (size: string): Product.Variant => ({
  id: `v-${size}`,
  size,
  color: 'preto',
  sku: `CAM-${size}`,
  priceInCents: 18990,
  stock: 1,
  active: true,
});

const summary = (overrides: Partial<ProductRepository.Summary>): ProductRepository.Summary => ({
  id: 'p-1',
  title: 'Camiseta Box Fit',
  status: 'active',
  brandId: 'brand-1',
  categoryId: 'category-1',
  grid: 'apparel',
  updatedAt: new Date('2026-11-12T12:00:00Z'),
  variants: [variant('G'), variant('P')],
  coverKey: 'uploads/m-1.webp',
  ...overrides,
});

function makeSut(summaries: ProductRepository.Summary[]) {
  const productRepository = { findSummaries: vi.fn<ProductRepository['findSummaries']>().mockResolvedValue(summaries) };
  const mediaStorageGateway = {
    getPublicUrl: vi.fn<MediaStorageGateway['getPublicUrl']>((key) => `https://cdn.test/${key}`),
  };
  const sut = new ListProductsUseCase(
    productRepository as unknown as ProductRepository,
    mediaStorageGateway as unknown as MediaStorageGateway,
  );

  return { sut };
}

describe('ListProductsUseCase', () => {
  it('turns the cover key into its CDN URL and sorts the variants by the grid', async () => {
    const { sut } = makeSut([summary({})]);

    const { products } = await sut.execute();

    expect(products).toEqual([{
      id: 'p-1',
      title: 'Camiseta Box Fit',
      status: 'active',
      brandId: 'brand-1',
      categoryId: 'category-1',
      coverUrl: 'https://cdn.test/uploads/m-1.webp',
      variants: [variant('P'), variant('G')],
      updatedAt: new Date('2026-11-12T12:00:00Z'),
    }]);
  });

  it('returns a null cover for a product without photos', async () => {
    const { sut } = makeSut([summary({ status: 'draft', coverKey: null })]);

    const { products } = await sut.execute();

    expect(products[0]!.coverUrl).toBeNull();
  });
});
