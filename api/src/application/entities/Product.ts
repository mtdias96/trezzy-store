import { randomUUID } from 'node:crypto';

import { ValidationError } from '@application/errors/ValidationError';

import { type SizeGrid, SIZES_BY_GRID } from './sizeGrids';
import { generateSku } from './sku';

export const PRODUCT_MAX_MEDIA = 10;

export class Product {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly status: Product.Status;
  readonly brandId: string;
  readonly categoryId: string;
  readonly publishedAt: Date | null;
  // Cores do mesmo modelo (ADR-018). null: produto sem outras cores.
  readonly familyId: string | null;
  readonly colorName: string | null;
  readonly variants: readonly Product.Variant[];
  // Ids de `media` na ordem da galeria: o primeiro é a capa.
  readonly mediaIds: readonly string[];

  // Reidrata do banco, sem gerar nada. Produto novo nasce pelo `create`.
  constructor(attr: Product.Attributes) {
    this.id = attr.id;
    this.slug = attr.slug;
    this.title = attr.title;
    this.description = attr.description;
    this.status = attr.status;
    this.brandId = attr.brandId;
    this.categoryId = attr.categoryId;
    this.publishedAt = attr.publishedAt;
    this.familyId = attr.familyId;
    this.colorName = attr.colorName;
    this.variants = attr.variants;
    this.mediaIds = attr.mediaIds;
  }

  static create({ category, variants, ...attr }: Product.CreateInput): Product {
    const sizes = SIZES_BY_GRID[category.grid];
    const issues = variants.flatMap(({ size }, index) =>
      sizes.includes(size)
        ? []
        : [{ field: `variants.${index}.size`, error: `Size must be one of: ${sizes.join(', ')}.` }],
    );

    // Sem capa, o card da vitrine fica quebrado. Rascunho pode ficar sem foto.
    if (attr.status === 'active' && attr.mediaIds.length === 0) {
      issues.push({ field: 'mediaIds', error: 'An active product needs at least one photo.' });
    }

    if (attr.mediaIds.length > PRODUCT_MAX_MEDIA) {
      issues.push({ field: 'mediaIds', error: `A product has at most ${PRODUCT_MAX_MEDIA} photos.` });
    }

    if (issues.length > 0) {
      throw new ValidationError(issues);
    }

    const id = randomUUID();

    return new Product({
      ...attr,
      id,
      categoryId: category.id,
      // O banco exige a data em todo produto ativo.
      publishedAt: attr.status === 'active' ? new Date() : null,
      variants: variants.map(({ sku, ...variant }) => ({
        ...variant,
        id: randomUUID(),
        sku: sku ?? generateSku({ categorySlug: category.slug, productId: id, size: variant.size, color: variant.color }),
      })),
    });
  }
}

export namespace Product {
  export type Status = 'draft' | 'active' | 'inactive' | 'archived';

  export type Variant = {
    id: string;
    size: string;
    color: string;
    sku: string;
    priceInCents: number;
    stock: number;
    active: boolean;
  };

  export type Attributes = {
    id: string;
    slug: string;
    title: string;
    description: string;
    status: Status;
    brandId: string;
    categoryId: string;
    publishedAt: Date | null;
    familyId: string | null;
    colorName: string | null;
    variants: readonly Variant[];
    mediaIds: readonly string[];
  };

  export type CreateInput = {
    slug: string;
    title: string;
    description: string;
    status: 'draft' | 'active';
    brandId: string;
    category: { id: string; slug: string; grid: SizeGrid };
    familyId: string | null;
    colorName: string | null;
    variants: readonly (Omit<Variant, 'id' | 'sku'> & { sku?: string })[];
    mediaIds: readonly string[];
  };
}
