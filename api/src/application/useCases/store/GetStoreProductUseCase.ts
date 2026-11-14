import { Injectable } from '@kernel/decorators/Injectable';
import { sortVariants } from '@application/entities/sizeGrids';
import { compareSizes, type Storefront, storePricing } from '@application/entities/storefront';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

const byName = new Intl.Collator('pt-BR', { sensitivity: 'base' });

@Injectable()
export class GetStoreProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly mediaStorageGateway: MediaStorageGateway,
  ) {}

  async execute(input: GetStoreProductUseCase.Input): Promise<GetStoreProductUseCase.Output> {
    const product = await this.productRepository.findStorefrontBySlug(input.slug);

    // Rascunho, inativo e arquivado respondem como inexistentes: a vitrine não revela o que não publicou.
    if (!product) {
      throw new ApplicationError(ErrorCode.NOT_FOUND, 'Product not found.');
    }

    const { id, slug, title, description, brandName, categorySlug, grid, familyId, colorName, priceInCents, variants, mediaKeys } = product;
    const imageUrls = mediaKeys.map((key) => this.mediaStorageGateway.getPublicUrl(key));
    const sizes = [...new Set(variants.map(({ size }) => size))].sort(compareSizes);
    const colorways = familyId ? await this.colorwaysOf(familyId, slug) : [];
    const storeVariants = sortVariants(grid, variants).map(({ id: variantId, color, size, stock }) => ({
      id: variantId,
      color,
      size,
      inStock: stock > 0,
    }));

    return {
      id,
      slug,
      title,
      description,
      brandName,
      categorySlug,
      priceInCents,
      ...storePricing(priceInCents),
      imageUrls,
      sizes,
      variants: storeVariants,
      colorName,
      colorways,
    };
  }

  // Em ordem alfabética do nome da cor, a atual incluída: o seletor mostra a fileira inteira.
  private async colorwaysOf(familyId: string, currentSlug: string): Promise<GetStoreProductUseCase.Colorway[]> {
    const colorways = await this.productRepository.findStorefrontColorways(familyId);

    return colorways
      .map(({ slug, colorName, coverKey, inStock }) => ({
        slug,
        colorName: colorName ?? '',
        coverUrl: coverKey ? this.mediaStorageGateway.getPublicUrl(coverKey) : null,
        inStock,
        current: slug === currentSlug,
      }))
      .sort((a, b) => byName.compare(a.colorName, b.colorName));
  }
}

export namespace GetStoreProductUseCase {
  export type Input = {
    slug: string;
  };

  export type Output = Storefront.Pricing & {
    id: string;
    slug: string;
    title: string;
    description: string;
    brandName: string;
    categorySlug: string;
    priceInCents: number;
    imageUrls: string[];
    sizes: string[];
    variants: { id: string; color: string; size: string; inStock: boolean }[];
    colorName: string | null;
    colorways: Colorway[];
  };

  export type Colorway = {
    slug: string;
    colorName: string;
    coverUrl: string | null;
    inStock: boolean;
    current: boolean;
  };
}
