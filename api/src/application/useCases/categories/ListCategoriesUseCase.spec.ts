import { describe, expect, it, vi } from 'vitest';

import type { CategoryRepository } from '@infra/database/repositories/CategoryRepository';

import { ListCategoriesUseCase } from './ListCategoriesUseCase';

describe('ListCategoriesUseCase', () => {
  it('sorts the categories by name in Portuguese, with accented letters in place', async () => {
    const categories = [
      { id: 'c-1', name: 'Tênis', grid: 'num' as const, active: true },
      { id: 'c-2', name: 'Óculos', grid: 'one' as const, active: true },
      { id: 'c-3', name: 'Bonés', grid: 'one' as const, active: true },
    ];
    const categoryRepository = { findAll: vi.fn<CategoryRepository['findAll']>().mockResolvedValue(categories) };
    const sut = new ListCategoriesUseCase(categoryRepository as unknown as CategoryRepository);

    const result = await sut.execute();

    expect(result.categories.map(({ name }) => name)).toEqual(['Bonés', 'Óculos', 'Tênis']);
  });
});
