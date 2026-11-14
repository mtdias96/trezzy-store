import { randomUUID } from 'node:crypto';

import { Injectable } from '@kernel/decorators/Injectable';
import { nextAvailableSlug, slugify } from '@shared/utils/slugify';
import { colorNameIssues, familyLinkIssues } from '@application/entities/colorway';
import { Product } from '@application/entities/Product';
import { ValidationError } from '@application/errors/ValidationError';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { BrandRepository } from '@infra/database/repositories/BrandRepository';
import { CategoryRepository } from '@infra/database/repositories/CategoryRepository';
import { MediaRepository } from '@infra/database/repositories/MediaRepository';
import { ProductFamilyRepository } from '@infra/database/repositories/ProductFamilyRepository';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly brandRepository: BrandRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly productFamilyRepository: ProductFamilyRepository,
    private readonly drizzle: DrizzleClient,
  ) { }

  async execute({
    title,
    description,
    status,
    brandId,
    categoryId,
    colorName,
    familyOf,
    variants,
    mediaIds,
  }: CreateProductUseCase.Input): Promise<CreateProductUseCase.Output> {
    const [brand, category, titleTaken, mediaUsage, target] = await Promise.all([
      this.brandRepository.findById(brandId),
      this.categoryRepository.findById(categoryId),
      this.productRepository.existsWithTitle(brandId, title),
      this.mediaRepository.findUsage(mediaIds),
      familyOf ? this.productRepository.findColorway(familyOf) : null,
    ]);

    const mediaIssues = this.findMediaIssues(mediaIds, mediaUsage);
    const familyIssues = familyOf ? familyLinkIssues({ id: null, brandId, categoryId }, target) : [];

    if (!brand || !category || mediaIssues.length > 0 || familyIssues.length > 0) {
      throw new ValidationError([
        ...(brand ? [] : [{ field: 'brandId', error: 'Brand not found.' }]),
        ...(category ? [] : [{ field: 'categoryId', error: 'Category not found.' }]),
        ...mediaIssues,
        ...familyIssues,
      ]);
    }

    const siblings = target ? (target.familyId ? await this.productRepository.findFamilyMembers(target.familyId) : [target]) : null;
    const colorIssues = colorNameIssues(colorName, siblings);

    if (colorIssues.length > 0) {
      throw new ValidationError(colorIssues);
    }

    if (titleTaken) {
      throw new ValidationError([{ field: 'title', error: 'A product with this title already exists for this brand.' }]);
    }

    const baseSlug = slugify(title);
    const slug = nextAvailableSlug(baseSlug, await this.productRepository.findSlugsStartingWith(baseSlug));

    // O produto de origem ainda sem família ganha uma agora, junto com o novo.
    const familyId = target ? (target.familyId ?? randomUUID()) : null;
    const product = Product.create({ slug, title, description, status, brandId, category, familyId, colorName, variants, mediaIds });

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

    await this.drizzle.transaction(async (tx) => {
      if (target && familyId && target.familyId === null) {
        await this.productFamilyRepository.create(familyId, tx);
        await this.productRepository.setColorway(target.id, { familyId, colorName: target.colorName }, tx);
      }

      await this.productRepository.create(product, tx);
    });

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
    colorName: string | null;
    // Um produto da mesma marca e categoria: o novo entra na família de cores dele.
    familyOf: string | null;
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
