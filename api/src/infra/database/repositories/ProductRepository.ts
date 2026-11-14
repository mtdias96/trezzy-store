import { and, asc, count, countDistinct, desc, eq, gt, inArray, like, ne, or, type SQL, sql } from 'drizzle-orm';

import { Injectable } from '@kernel/decorators/Injectable';
import type { ColorwayProduct } from '@application/entities/colorway';
import type { Product } from '@application/entities/Product';
import type { SizeGrid } from '@application/entities/sizeGrids';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { storefrontVisible } from '@infra/database/drizzle/conditions/storefrontVisible';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { isUniqueViolation } from '@infra/database/drizzle/isUniqueViolation';
import { brands, categories, productMedia, products, productVariants } from '@infra/database/drizzle/schema/catalog';
import { media } from '@infra/database/drizzle/schema/media';

// Preço do card: a variante ativa mais barata. O storefrontVisible garante que ela existe.
const storefrontPrice = sql<number>`(select min(${productVariants.priceInCents}) from ${productVariants} where ${productVariants.productId} = ${products.id} and ${productVariants.active})`;

const STOREFRONT_ORDER = {
  newest: [desc(products.publishedAt), desc(products.id)],
  'price-asc': [asc(storefrontPrice), desc(products.publishedAt), desc(products.id)],
  'price-desc': [desc(storefrontPrice), desc(products.publishedAt), desc(products.id)],
} satisfies Record<ProductRepository.StorefrontOrder, SQL[]>;

// O use case valida título, SKU e fotos antes da transação: dois cadastros ao mesmo tempo passam nos dois, e o unique
// barra o segundo. Sem este mapa, o segundo receberia 500.
const CONCURRENT_CONFLICTS = [
  { name: 'products_slug_unique', message: 'A product with this title was just created.' },
  { name: 'product_variants_sku_unique', message: 'SKU already in use.' },
  { name: 'product_media_pkey', message: 'A photo is already in use by another product.' },
  { name: 'products_family_color_unique', message: 'Another color of this model already has this name.' },
] as const;

function toConflict(error: unknown): unknown {
  const constraint = CONCURRENT_CONFLICTS.find(({ name }) => isUniqueViolation(error, name));

  return constraint ? new ApplicationError(ErrorCode.CONFLICT, constraint.message) : error;
}

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
        familyId: product.familyId,
        colorName: product.colorName,
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
      throw toConflict(error);
    }
  }

  async findColorway(id: string): Promise<ColorwayProduct | null> {
    const [row] = await this.drizzle.db
      .select({
        id: products.id,
        brandId: products.brandId,
        categoryId: products.categoryId,
        familyId: products.familyId,
        colorName: products.colorName,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return row ?? null;
  }

  // As cores da família, com a capa, em ordem alfabética do nome da cor.
  async findFamilyMembers(familyId: string): Promise<ProductRepository.FamilyMember[]> {
    const rows = await this.drizzle.db
      .select({ id: products.id, title: products.title, colorName: products.colorName, status: products.status })
      .from(products)
      .where(eq(products.familyId, familyId));
    const covers = await this.findMediaKeysByProduct(rows.map(({ id }) => id));

    return rows
      .map((row) => ({ ...row, coverKey: covers.get(row.id)?.[0] ?? null }))
      .sort((a, b) => (a.colorName ?? '').localeCompare(b.colorName ?? '', 'pt-BR'));
  }

  async setColorway(id: string, { familyId, colorName }: ProductRepository.Colorway, tx: DrizzleClient.Transaction): Promise<void> {
    try {
      await tx.update(products).set({ familyId, colorName, updatedAt: new Date() }).where(eq(products.id, id));
    } catch (error) {
      throw toConflict(error);
    }
  }

  // O painel filtra e ordena a lista inteira (sem paginação até a API paginar).
  async findSummaries(): Promise<ProductRepository.Summary[]> {
    const rows = await this.drizzle.db
      .select({
        id: products.id,
        title: products.title,
        status: products.status,
        brandId: products.brandId,
        categoryId: products.categoryId,
        grid: categories.grid,
        familyId: products.familyId,
        colorName: products.colorName,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .orderBy(desc(products.updatedAt), desc(products.id));

    const ids = rows.map(({ id }) => id);
    const [variantsByProduct, covers] = await Promise.all([
      this.findVariantsByProduct(ids),
      ids.length === 0
        ? []
        : this.drizzle.db
          .selectDistinctOn([productMedia.productId], { productId: productMedia.productId, key: media.key })
          .from(productMedia)
          .innerJoin(media, eq(media.id, productMedia.mediaId))
          .where(inArray(productMedia.productId, ids))
          .orderBy(productMedia.productId, asc(productMedia.position)),
    ]);
    const coverKeyByProduct = new Map(covers.map(({ productId, key }) => [productId, key]));

    return rows.map((row) => ({
      ...row,
      variants: variantsByProduct.get(row.id) ?? [],
      coverKey: coverKeyByProduct.get(row.id) ?? null,
    }));
  }

  async findDetailById(id: string): Promise<ProductRepository.Detail | null> {
    const [row] = await this.drizzle.db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        status: products.status,
        brandId: products.brandId,
        categoryId: products.categoryId,
        grid: categories.grid,
        familyId: products.familyId,
        colorName: products.colorName,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(eq(products.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    const [variantsByProduct, gallery] = await Promise.all([
      this.findVariantsByProduct([row.id]),
      this.drizzle.db
        .select({ id: media.id, key: media.key })
        .from(productMedia)
        .innerJoin(media, eq(media.id, productMedia.mediaId))
        .where(eq(productMedia.productId, row.id))
        .orderBy(asc(productMedia.position)),
    ]);

    return { ...row, variants: variantsByProduct.get(row.id) ?? [], media: gallery };
  }

  // Página da listagem da vitrine com o total e os facets. Cada facet ignora o próprio filtro: marcar uma marca não
  // zera as outras.
  async findStorefrontPage(query: ProductRepository.StorefrontQuery): Promise<ProductRepository.StorefrontPage> {
    const { order, page, limit } = query;

    const [rows, [totalRow], sizeFacet, brandCounts, activeBrands] = await Promise.all([
      this.drizzle.db
        .select({
          id: products.id,
          slug: products.slug,
          title: products.title,
          brandName: brands.name,
          grid: categories.grid,
          priceInCents: storefrontPrice,
        })
        .from(products)
        .innerJoin(brands, eq(brands.id, products.brandId))
        .innerJoin(categories, eq(categories.id, products.categoryId))
        .where(this.storefrontWhere(query))
        .orderBy(...STOREFRONT_ORDER[order])
        .limit(limit)
        .offset((page - 1) * limit),
      this.drizzle.db
        .select({ total: count() })
        .from(products)
        .innerJoin(brands, eq(brands.id, products.brandId))
        .innerJoin(categories, eq(categories.id, products.categoryId))
        .where(this.storefrontWhere(query)),
      this.drizzle.db
        .select({ value: productVariants.size, count: countDistinct(products.id) })
        .from(products)
        .innerJoin(brands, eq(brands.id, products.brandId))
        .innerJoin(categories, eq(categories.id, products.categoryId))
        .innerJoin(productVariants, and(
          eq(productVariants.productId, products.id),
          eq(productVariants.active, true),
          gt(productVariants.stock, 0),
        ))
        .where(this.storefrontWhere(query, 'sizes'))
        .groupBy(productVariants.size),
      this.drizzle.db
        .select({ brandId: products.brandId, count: count() })
        .from(products)
        .innerJoin(brands, eq(brands.id, products.brandId))
        .innerJoin(categories, eq(categories.id, products.categoryId))
        .where(this.storefrontWhere(query, 'brands'))
        .groupBy(products.brandId),
      this.drizzle.db.select({ id: brands.id, slug: brands.slug, name: brands.name }).from(brands).where(eq(brands.active, true)),
    ]);

    const ids = rows.map(({ id }) => id);
    const [variantsByProduct, mediaKeysByProduct] = await Promise.all([
      this.findVariantsByProduct(ids),
      this.findMediaKeysByProduct(ids),
    ]);
    const countByBrand = new Map(brandCounts.map(({ brandId, count: total }) => [brandId, total]));

    return {
      products: rows.map((row) => ({
        ...row,
        variants: variantsByProduct.get(row.id) ?? [],
        mediaKeys: mediaKeysByProduct.get(row.id) ?? [],
      })),
      total: totalRow?.total ?? 0,
      facets: {
        sizes: sizeFacet,
        brands: activeBrands.map(({ id, slug, name }) => ({ slug, name, count: countByBrand.get(id) ?? 0 })),
      },
    };
  }

  // Só o produto que a vitrine mostra, com as variantes ativas.
  async findStorefrontBySlug(slug: string): Promise<ProductRepository.StorefrontDetail | null> {
    const [row] = await this.drizzle.db
      .select({
        id: products.id,
        slug: products.slug,
        title: products.title,
        description: products.description,
        brandName: brands.name,
        categorySlug: categories.slug,
        grid: categories.grid,
        familyId: products.familyId,
        colorName: products.colorName,
        priceInCents: storefrontPrice,
      })
      .from(products)
      .innerJoin(brands, eq(brands.id, products.brandId))
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(and(eq(products.slug, slug), storefrontVisible))
      .limit(1);

    if (!row) {
      return null;
    }

    const [variantsByProduct, mediaKeysByProduct] = await Promise.all([
      this.findVariantsByProduct([row.id]),
      this.findMediaKeysByProduct([row.id]),
    ]);

    return {
      ...row,
      variants: (variantsByProduct.get(row.id) ?? []).filter(({ active }) => active),
      mediaKeys: mediaKeysByProduct.get(row.id) ?? [],
    };
  }

  // As cores da família que a vitrine mostra, com a capa e se alguma variante tem estoque.
  async findStorefrontColorways(familyId: string): Promise<ProductRepository.StorefrontColorway[]> {
    const rows = await this.drizzle.db
      .select({
        id: products.id,
        slug: products.slug,
        colorName: products.colorName,
        inStock: sql<boolean>`exists (select 1 from ${productVariants} where ${productVariants.productId} = ${products.id} and ${productVariants.active} and ${productVariants.stock} > 0)`,
      })
      .from(products)
      .innerJoin(brands, eq(brands.id, products.brandId))
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(and(eq(products.familyId, familyId), storefrontVisible));
    const covers = await this.findMediaKeysByProduct(rows.map(({ id }) => id));

    return rows.map(({ id, ...row }) => ({ ...row, coverKey: covers.get(id)?.[0] ?? null }));
  }

  private storefrontWhere(
    { categorySlugs, brandSlugs, sizes, priceAboveInCents, priceUpToInCents }: ProductRepository.StorefrontQuery,
    ignore?: 'sizes' | 'brands',
  ) {
    return and(
      storefrontVisible,
      categorySlugs.length > 0 ? inArray(categories.slug, categorySlugs) : undefined,
      ignore !== 'brands' && brandSlugs.length > 0 ? inArray(brands.slug, brandSlugs) : undefined,
      ignore !== 'sizes' && sizes.length > 0
        ? sql`exists (select 1 from ${productVariants} where ${productVariants.productId} = ${products.id} and ${productVariants.active} and ${productVariants.stock} > 0 and ${inArray(productVariants.size, sizes)})`
        : undefined,
      priceAboveInCents !== null ? sql`${storefrontPrice} > ${priceAboveInCents}` : undefined,
      priceUpToInCents !== null ? sql`${storefrontPrice} <= ${priceUpToInCents}` : undefined,
    );
  }

  // Chaves das fotos de cada produto, na ordem da galeria (a primeira é a capa).
  private async findMediaKeysByProduct(productIds: readonly string[]): Promise<Map<string, string[]>> {
    const byProduct = new Map<string, string[]>();

    if (productIds.length === 0) {
      return byProduct;
    }

    const rows = await this.drizzle.db
      .select({ productId: productMedia.productId, key: media.key })
      .from(productMedia)
      .innerJoin(media, eq(media.id, productMedia.mediaId))
      .where(inArray(productMedia.productId, [...productIds]))
      .orderBy(productMedia.productId, asc(productMedia.position));

    for (const { productId, key } of rows) {
      byProduct.set(productId, [...(byProduct.get(productId) ?? []), key]);
    }

    return byProduct;
  }

  private async findVariantsByProduct(productIds: readonly string[]): Promise<Map<string, Product.Variant[]>> {
    const byProduct = new Map<string, Product.Variant[]>();

    if (productIds.length === 0) {
      return byProduct;
    }

    const rows = await this.drizzle.db
      .select({
        productId: productVariants.productId,
        id: productVariants.id,
        size: productVariants.size,
        color: productVariants.color,
        sku: productVariants.sku,
        priceInCents: productVariants.priceInCents,
        stock: productVariants.stock,
        active: productVariants.active,
      })
      .from(productVariants)
      .where(inArray(productVariants.productId, [...productIds]));

    for (const { productId, ...variant } of rows) {
      byProduct.set(productId, [...(byProduct.get(productId) ?? []), variant]);
    }

    return byProduct;
  }
}

export namespace ProductRepository {
  type Base = {
    id: string;
    title: string;
    status: Product.Status;
    brandId: string;
    categoryId: string;
    grid: SizeGrid;
    updatedAt: Date;
    variants: Product.Variant[];
  };

  export type Summary = Base & {
    familyId: string | null;
    colorName: string | null;
    coverKey: string | null;
  };

  export type Detail = Base & {
    description: string;
    familyId: string | null;
    colorName: string | null;
    media: { id: string; key: string }[];
  };

  export type FamilyMember = {
    id: string;
    title: string;
    colorName: string | null;
    status: Product.Status;
    coverKey: string | null;
  };

  export type Colorway = {
    familyId: string | null;
    colorName: string | null;
  };

  export type StorefrontOrder = 'newest' | 'price-asc' | 'price-desc';

  export type StorefrontQuery = {
    categorySlugs: string[];
    brandSlugs: string[];
    sizes: string[];
    priceAboveInCents: number | null;
    priceUpToInCents: number | null;
    order: StorefrontOrder;
    page: number;
    limit: number;
  };

  export type StorefrontItem = {
    id: string;
    slug: string;
    title: string;
    brandName: string;
    grid: SizeGrid;
    priceInCents: number;
    variants: Product.Variant[];
    // Na ordem da galeria.
    mediaKeys: string[];
  };

  export type StorefrontDetail = StorefrontItem & {
    description: string;
    categorySlug: string;
    familyId: string | null;
    colorName: string | null;
  };

  export type StorefrontColorway = {
    slug: string;
    colorName: string | null;
    coverKey: string | null;
    inStock: boolean;
  };

  export type StorefrontPage = {
    products: StorefrontItem[];
    total: number;
    facets: {
      sizes: { value: string; count: number }[];
      brands: { slug: string; name: string; count: number }[];
    };
  };
}
