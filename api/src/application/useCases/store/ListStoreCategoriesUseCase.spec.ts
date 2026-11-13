import { describe, expect, it, vi } from 'vitest';

import type { CategoryRepository } from '@infra/database/repositories/CategoryRepository';
import type { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

import { ListStoreCategoriesUseCase } from './ListStoreCategoriesUseCase';

describe('ListStoreCategoriesUseCase', () => {
  it('turns the cover key into the public URL and keeps categories without a product', async () => {
    const categories = [
      { slug: 'tenis', productCount: 2, coverKey: 'uploads/cover.webp' },
      { slug: 'oculos', productCount: 0, coverKey: null },
    ];
    const categoryRepository = { findStorefront: vi.fn<CategoryRepository['findStorefront']>().mockResolvedValue(categories) };
    const mediaStorageGateway = { getPublicUrl: (key: string) => `https://cdn.test/${key}` };
    const sut = new ListStoreCategoriesUseCase(
      categoryRepository as unknown as CategoryRepository,
      mediaStorageGateway as unknown as MediaStorageGateway,
    );

    await expect(sut.execute()).resolves.toEqual({
      categories: [
        { slug: 'tenis', productCount: 2, coverUrl: 'https://cdn.test/uploads/cover.webp' },
        { slug: 'oculos', productCount: 0, coverUrl: null },
      ],
    });
  });
});
