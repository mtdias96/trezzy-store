import { describe, expect, it, vi } from 'vitest';

import type { BrandRepository } from '@infra/database/repositories/BrandRepository';
import type { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

import { ListStoreBrandsUseCase } from './ListStoreBrandsUseCase';

describe('ListStoreBrandsUseCase', () => {
  it('puts the brands with more products first, breaks ties by name in Portuguese and keeps the limit', async () => {
    const brands = [
      { slug: 'vans', name: 'Vans', logoKey: 'uploads/vans.webp', productCount: 2 },
      { slug: 'oca', name: 'Oca', logoKey: null, productCount: 5 },
      { slug: 'agua', name: 'Água', logoKey: null, productCount: 2 },
      { slug: 'lost', name: 'Lost', logoKey: null, productCount: 1 },
    ];
    const brandRepository = { findStorefront: vi.fn<BrandRepository['findStorefront']>().mockResolvedValue(brands) };
    const mediaStorageGateway = { getPublicUrl: (key: string) => `https://cdn.test/${key}` };
    const sut = new ListStoreBrandsUseCase(
      brandRepository as unknown as BrandRepository,
      mediaStorageGateway as unknown as MediaStorageGateway,
    );

    await expect(sut.execute({ limit: 3 })).resolves.toEqual({
      brands: [
        { slug: 'oca', name: 'Oca', productCount: 5, imageUrl: null },
        { slug: 'agua', name: 'Água', productCount: 2, imageUrl: null },
        { slug: 'vans', name: 'Vans', productCount: 2, imageUrl: 'https://cdn.test/uploads/vans.webp' },
      ],
    });
  });
});
