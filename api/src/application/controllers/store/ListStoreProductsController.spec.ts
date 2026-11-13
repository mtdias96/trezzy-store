import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';
import type { ListStoreProductsUseCase } from '@application/useCases/store/ListStoreProductsUseCase';

import { ListStoreProductsController } from './ListStoreProductsController';

const page = { products: [], total: 0, facets: { sizes: [], brands: [] } };

function makeSut() {
  const execute = vi.fn<ListStoreProductsUseCase['execute']>().mockResolvedValue(page);
  const sut = new ListStoreProductsController({ execute } as unknown as ListStoreProductsUseCase);
  const request = (queryParams: Record<string, string>) => ({ body: undefined, params: {}, queryParams, accountId: null });

  return { sut, execute, request };
}

describe('ListStoreProductsController', () => {
  it('reads the comma-joined lists the HTTP API sends for repeated parameters', async () => {
    const { sut, execute, request } = makeSut();

    await sut.execute(request({
      category: 'camisetas,moletons',
      size: 'M,G',
      brand: 'vans',
      priceAboveInCents: '30000',
      priceUpToInCents: '70000',
      sort: 'price-asc',
      page: '2',
      limit: '12',
    }));

    expect(execute).toHaveBeenCalledWith({
      categorySlugs: ['camisetas', 'moletons'],
      brandSlugs: ['vans'],
      sizes: ['M', 'G'],
      priceAboveInCents: 30_000,
      priceUpToInCents: 70_000,
      sort: 'price-asc',
      page: 2,
      limit: 12,
    });
  });

  it('defaults to every product, by relevance, first page of 24, and ignores unknown parameters', async () => {
    const { sut, execute, request } = makeSut();

    await expect(sut.execute(request({ featured: 'true', period: 'week' }))).resolves.toEqual({ statusCode: 200, body: page });
    expect(execute).toHaveBeenCalledWith({
      categorySlugs: [],
      brandSlugs: [],
      sizes: [],
      priceAboveInCents: null,
      priceUpToInCents: null,
      sort: 'relevance',
      page: 1,
      limit: 24,
    });
  });

  it.each<Record<string, string>>([
    { category: 'Tênis' },
    { sort: 'cheapest' },
    { limit: '100' },
    { page: '0' },
  ])('rejects %o before calling the use case', async (queryParams) => {
    const { sut, execute, request } = makeSut();

    await expect(sut.execute(request(queryParams))).rejects.toBeInstanceOf(ValidationError);
    expect(execute).not.toHaveBeenCalled();
  });
});
