import { and, eq, inArray, like, ne, or, sql } from 'drizzle-orm';

import { Injectable } from '@kernel/decorators/Injectable';
import type { Product } from '@application/entities/Product';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { isUniqueViolation } from '@infra/database/drizzle/isUniqueViolation';
import { productMedia, products, productVariants } from '@infra/database/drizzle/schema/catalog';

// O use case valida título, SKU e fotos antes da transação: dois cadastros ao mesmo tempo passam nos dois, e o unique
// barra o segundo. Sem este mapa, o segundo receberia 500.
const CONCURRENT_CONFLICTS = [
  { name: 'products_slug_unique', message: 'A product with this title was just created.' },
  { name: 'product_variants_sku_unique', message: 'SKU already in use.' },
  { name: 'product_media_pkey', message: 'A photo is already in use by another product.' },
] as const;

@Injectable()
export class ProductRepository {
  constructor(private readonly drizzle: DrizzleClient) {}

  // O slug não tem `%` nem `_`, então o LIKE é literal.
  async findSlugsStartingWith(base: string): Promise<string[]> {
    const rows = await this.drizzle.db
      .select({ slug: products.slug })
      .from(products)
      .where(or(eq(products.slug, base), like(products.slug, `${base}-%`)));

    return rows.map(({ slug }) => slug);
  }

  // Arquivado fica de fora: relançamento pode repetir o título.
  // `lower() =` e não ILIKE: `%` e `_` no título ("100% algodão") virariam curinga.
  async existsWithTitle(brandId: string, title: string): Promise<boolean> {
    const [row] = await this.drizzle.db
      .select({ id: products.id })
      .from(products)
      .where(and(
        eq(products.brandId, brandId),
        ne(products.status, 'archived'),
        sql`lower(${products.title}) = lower(${title})`,
      ))
      .limit(1);

    return row !== undefined;
  }

  async findExistingSkus(skus: readonly string[]): Promise<string[]> {
    if (skus.length === 0) {
      return [];
    }

    const rows = await this.drizzle.db
      .select({ sku: productVariants.sku })
      .from(productVariants)
      .where(inArray(productVariants.sku, [...skus]));

    return rows.map(({ sku }) => sku);
  }

  // Produto e variantes são gravados juntos: sem `tx`, abre a própria transação.
  async create(product: Product, tx?: DrizzleClient.Transaction): Promise<void> {
    if (!tx) {
      return this.drizzle.transaction((transaction) => this.create(product, transaction));
    }

    try {
      await tx.insert(products).values({
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        status: product.status,
        brandId: product.brandId,
        categoryId: product.categoryId,
        publishedAt: product.publishedAt,
      });

      if (product.variants.length > 0) {
        await tx.insert(productVariants).values(
          product.variants.map((variant) => ({
            id: variant.id,
            productId: product.id,
            size: variant.size,
            color: variant.color,
            sku: variant.sku,
            priceInCents: variant.priceInCents,
            stock: variant.stock,
            active: variant.active,
          })),
        );
      }

      if (product.mediaIds.length > 0) {
        await tx.insert(productMedia).values(
          product.mediaIds.map((mediaId, position) => ({ mediaId, productId: product.id, position })),
        );
      }
    } catch (error) {
      const constraint = CONCURRENT_CONFLICTS.find(({ name }) => isUniqueViolation(error, name));

      if (constraint) {
        throw new ApplicationError(ErrorCode.CONFLICT, constraint.message);
      }

      throw error;
    }
  }
}
