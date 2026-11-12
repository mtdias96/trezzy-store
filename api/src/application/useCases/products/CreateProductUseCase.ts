import { Injectable } from '@kernel/decorators/Injectable';
import { nextAvailableSlug, slugify } from '@shared/utils/slugify';
import { Product } from '@application/entities/Product';
import { ValidationError } from '@application/errors/ValidationError';
import { BrandRepository } from '@infra/database/repositories/BrandRepository';
import { CategoryRepository } from '@infra/database/repositories/CategoryRepository';
import { MediaRepository } from '@infra/database/repositories/MediaRepository';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly brandRepository: BrandRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly mediaRepository: MediaRepository,
  ) { }

  async execute({
    title,
    description,
    status,
    brandId,
    categoryId,
    variants,
    mediaIds,
  }: CreateProductUseCase.Input): Promise<CreateProductUseCase.Output> {
    const [brand, category, titleTaken, mediaUsage] = await Promise.all([
      this.brandRepository.findById(brandId),
      this.categoryRepository.findById(categoryId),
      this.productRepository.existsWithTitle(brandId, title),
      this.mediaRepository.findUsage(mediaIds),
    ]);

    const mediaIssues = this.findMediaIssues(mediaIds, mediaUsage);

    if (!brand || !category || mediaIssues.length > 0) {
      throw new ValidationError([
        ...(brand ? [] : [{ field: 'brandId', error: 'Brand not found.' }]),
        ...(category ? [] : [{ field: 'categoryId', error: 'Category not found.' }]),
        ...mediaIssues,
      ]);
    }

    if (titleTaken) {
      throw new ValidationError([{ field: 'title', error: 'A product with this title already exists for this brand.' }]);
    }

    const baseSlug = slugify(title);
    const slug = nextAvailableSlug(baseSlug, await this.productRepository.findSlugsStartingWith(baseSlug));

    const product = Product.create({ slug, title, description, status, brandId, category, variants, mediaIds });

    const skusInUse = new Set(
      await this.productRepository.findExistingSkus(product.variants.map(({ sku }) => sku)),
    );

    if (skusInUse.size > 0) {
      throw new ValidationError(
        product.variants.flatMap(({ sku }, index) =>
          skusInUse.has(sku) ? [{ field: `variants.${index}.sku`, error: 'SKU already in use.' }] : [],
        ),
      );
    }

    await this.productRepository.create(product);

    return { id: product.id };
  }

  private findMediaIssues(mediaIds: readonly string[], usage: readonly MediaRepository.Usage[]): ValidationError.Issue[] {
    const usageById = new Map(usage.map((item) => [item.id, item]));

    return mediaIds.flatMap((mediaId, index) => {
      const item = usageById.get(mediaId);
      const field = `mediaIds.${index}`;

      if (!item) {
        return [{ field, error: 'Media not found.' }];
      }

      if (!item.uploadedAt) {
        return [{ field, error: 'Media upload is not confirmed.' }];
      }

      return item.inUse ? [{ field, error: 'Media is already in use.' }] : [];
    });
  }
}

export namespace CreateProductUseCase {
  export type Input = {
    title: string;
    description: string;
    status: 'draft' | 'active';
    brandId: string;
    categoryId: string;
    variants: {
      size: string;
      color: string;
      sku?: string;
      priceInCents: number;
      stock: number;
      active: boolean;
    }[];
    mediaIds: string[];
  };

  export type Output = { id: string };
}
