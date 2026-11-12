import { Injectable } from '@kernel/decorators/Injectable';
import type { Product } from '@application/entities/Product';
import { sortVariants } from '@application/entities/sizeGrids';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

@Injectable()
export class ListProductsUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly mediaStorageGateway: MediaStorageGateway,
  ) {}

  async execute(): Promise<ListProductsUseCase.Output> {
    const products = await this.productRepository.findSummaries();

    return {
      products: products.map(({ id, title, status, brandId, categoryId, grid, variants, coverKey, updatedAt }) => ({
        id,
        title,
        status,
        brandId,
        categoryId,
        coverUrl: coverKey ? this.mediaStorageGateway.getPublicUrl(coverKey) : null,
        variants: sortVariants(grid, variants),
        updatedAt,
      })),
    };
  }
}

export namespace ListProductsUseCase {
  export type Output = {
    products: {
      id: string;
      title: string;
      status: Product.Status;
      brandId: string;
      categoryId: string;
      coverUrl: string | null;
      variants: Product.Variant[];
      updatedAt: Date;
    }[];
  };
}
