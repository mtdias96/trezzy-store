import { Injectable } from '@kernel/decorators/Injectable';
import { CategoryRepository } from '@infra/database/repositories/CategoryRepository';
import { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

@Injectable()
export class ListStoreCategoriesUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly mediaStorageGateway: MediaStorageGateway,
  ) {}

  async execute(): Promise<ListStoreCategoriesUseCase.Output> {
    const categories = await this.categoryRepository.findStorefront();

    return {
      categories: categories.map(({ slug, productCount, coverKey }) => ({
        slug,
        productCount,
        coverUrl: coverKey ? this.mediaStorageGateway.getPublicUrl(coverKey) : null,
      })),
    };
  }
}

export namespace ListStoreCategoriesUseCase {
  export type Output = {
    categories: { slug: string; productCount: number; coverUrl: string | null }[];
  };
}
