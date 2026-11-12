import { Injectable } from '@kernel/decorators/Injectable';
import type { Product } from '@application/entities/Product';
import { sortVariants } from '@application/entities/sizeGrids';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

@Injectable()
export class GetProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly mediaStorageGateway: MediaStorageGateway,
  ) {}

  async execute({ productId }: GetProductUseCase.Input): Promise<GetProductUseCase.Output> {
    const product = await this.productRepository.findDetailById(productId);

    if (!product) {
      throw new ApplicationError(ErrorCode.NOT_FOUND, 'Product not found.');
    }

    const { id, title, description, status, brandId, categoryId, grid, variants, media, updatedAt } = product;

    return {
      id,
      title,
      description,
      status,
      brandId,
      categoryId,
      variants: sortVariants(grid, variants),
      media: media.map(({ id: mediaId, key }) => ({ id: mediaId, url: this.mediaStorageGateway.getPublicUrl(key) })),
      updatedAt,
    };
  }
}

export namespace GetProductUseCase {
  export type Input = {
    productId: string;
  };

  export type Output = {
    id: string;
    title: string;
    description: string;
    status: Product.Status;
    brandId: string;
    categoryId: string;
    variants: Product.Variant[];
    media: { id: string; url: string }[];
    updatedAt: Date;
  };
}
