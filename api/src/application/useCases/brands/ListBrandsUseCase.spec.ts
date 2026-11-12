import { describe, expect, it, vi } from 'vitest';

import type { BrandRepository } from '@infra/database/repositories/BrandRepository';

import { ListBrandsUseCase } from './ListBrandsUseCase';

describe('ListBrandsUseCase', () => {
  it('sorts the brands by name in Portuguese, ignoring case', async () => {
    const brands = [
      { id: 'b-1', name: 'Vans', active: true },
      { id: 'b-2', name: 'adidas Originals', active: false },
      { id: 'b-3', name: 'Carhartt WIP', active: true },
    ];
    const brandRepository = { findAll: vi.fn<BrandRepository['findAll']>().mockResolvedValue(brands) };
    const sut = new ListBrandsUseCase(brandRepository as unknown as BrandRepository);

    const result = await sut.execute();

    expect(result.brands.map(({ name }) => name)).toEqual(['adidas Originals', 'Carhartt WIP', 'Vans']);
  });
});
