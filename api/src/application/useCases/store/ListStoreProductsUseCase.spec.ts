import { describe, expect, it, vi } from 'vitest';

import type { ProductRepository } from '@infra/database/repositories/ProductRepository';
import type { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

import { ListStoreProductsUseCase } from './ListStoreProductsUseCase';

const query = {
  categorySlugs: ['tenis'],
  brandSlugs: [],
  sizes: [],
  priceAboveInCents: null,
  priceUpToInCents: 60_000,
  page: 1,
  limit: 24,
};

const item = (overrides: Partial<ProductRepository.StorefrontItem> = {}): ProductRepository.StorefrontItem => ({
  id: 'p-1',
  slug: 'old-skool',
  title: 'Old Skool',
  brandName: 'Vans',
  grid: 'num',
  priceInCents: 58_700,
  variants: [{ id: 'v-40', size: '40', color: '', sku: 'TEN-40', priceInCents: 58_700, stock: 1, active: true }],
  mediaKeys: ['uploads/a.webp', 'uploads/b.webp', 'uploads/c.webp'],
  ...overrides,
});

function makeSut(page: Partial<ProductRepository.StorefrontPage> = {}) {
  const findStorefrontPage = vi.fn<ProductRepository['findStorefrontPage']>().mockResolvedValue({
    products: [item()],
    total: 1,
    facets: { sizes: [], brands: [] },
    ...page,
  });
  const productRepository = { findStorefrontPage };
  const mediaStorageGateway = { getPublicUrl: (key: string) => `https://cdn.test/${key}` };
  const sut = new ListStoreProductsUseCase(
    productRepository as unknown as ProductRepository,
    mediaStorageGateway as unknown as MediaStorageGateway,
  );

  return { sut, findStorefrontPage };
}

describe('ListStoreProductsUseCase', () => {
  it('builds the card: pricing, cover and hover photo, and the sizes of the default color', async () => {
    const { sut } = makeSut();

    const { products } = await sut.execute({ ...query, sort: 'newest' });

    expect(products).toEqual([{
      id: 'p-1',
      slug: 'old-skool',
      title: 'Old Skool',
      brandName: 'Vans',
      priceInCents: 58_700,
      installments: { count: 10, valueInCents: 5_870 },
      pixPriceInCents: 52_830,
      coverUrl: 'https://cdn.test/uploads/a.webp',
      hoverImageUrl: 'https://cdn.test/uploads/b.webp',
      sizeOptions: [{ size: '40', variantId: 'v-40' }],
    }]);
  });

  it('sends null photos when the product has only a cover or none', async () => {
    const { sut } = makeSut({ products: [item({ id: 'one', mediaKeys: ['uploads/a.webp'] }), item({ id: 'none', mediaKeys: [] })] });

    const { products } = await sut.execute({ ...query, sort: 'newest' });

    expect(products.map(({ coverUrl, hoverImageUrl }) => [coverUrl, hoverImageUrl])).toEqual([
      ['https://cdn.test/uploads/a.webp', null],
      [null, null],
    ]);
  });

  it.each([
    ['relevance', 'newest'],
    ['best-selling', 'newest'],
    ['price-asc', 'price-asc'],
  ] as const)('orders %s as %s', async (sort, order) => {
    const { sut, findStorefrontPage } = makeSut();

    await sut.execute({ ...query, sort });

    expect(findStorefrontPage).toHaveBeenCalledWith({ ...query, order });
  });

  it('orders the size facet by grid and the brand facet by name in Portuguese', async () => {
    const { sut } = makeSut({
      facets: {
        sizes: [{ value: 'G', count: 1 }, { value: '42', count: 2 }, { value: 'P', count: 3 }],
        brands: [{ slug: 'vans', name: 'Vans', count: 1 }, { slug: 'agua', name: 'Água', count: 0 }],
      },
    });

    const { facets } = await sut.execute({ ...query, sort: 'newest' });

    expect(facets.sizes.map(({ value }) => value)).toEqual(['42', 'P', 'G']);
    expect(facets.brands.map(({ name }) => name)).toEqual(['Água', 'Vans']);
  });
});
