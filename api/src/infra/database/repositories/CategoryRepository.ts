import { asc, count, desc, eq } from 'drizzle-orm';

import { Injectable } from '@kernel/decorators/Injectable';
import type { SizeGrid } from '@application/entities/sizeGrids';
import { storefrontVisible } from '@infra/database/drizzle/conditions/storefrontVisible';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { brands, categories, productMedia, products } from '@infra/database/drizzle/schema/catalog';
import { media } from '@infra/database/drizzle/schema/media';

@Injectable()
export class CategoryRepository {
  constructor(private readonly drizzle: DrizzleClient) {}

  async findById(id: string): Promise<CategoryRepository.Category | null> {
    const [category] = await this.drizzle.db
      .select({ id: categories.id, slug: categories.slug, grid: categories.grid })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return category ?? null;
  }

  async findAll(): Promise<CategoryRepository.ListItem[]> {
    return this.drizzle.db
      .select({ id: categories.id, name: categories.name, grid: categories.grid, active: categories.active })
      .from(categories);
  }

  // Categorias ativas, com a contagem dos produtos visíveis e a capa do mais novo deles.
  async findStorefront(): Promise<CategoryRepository.StorefrontItem[]> {
    const [rows, counts, covers] = await Promise.all([
      this.drizzle.db.select({ id: categories.id, slug: categories.slug }).from(categories).where(eq(categories.active, true)),
      this.drizzle.db
        .select({ categoryId: products.categoryId, total: count() })
        .from(products)
        .innerJoin(brands, eq(brands.id, products.brandId))
        .innerJoin(categories, eq(categories.id, products.categoryId))
        .where(storefrontVisible)
        .groupBy(products.categoryId),
      this.drizzle.db
        .selectDistinctOn([products.categoryId], { categoryId: products.categoryId, key: media.key })
        .from(products)
        .innerJoin(brands, eq(brands.id, products.brandId))
        .innerJoin(categories, eq(categories.id, products.categoryId))
        .innerJoin(productMedia, eq(productMedia.productId, products.id))
        .innerJoin(media, eq(media.id, productMedia.mediaId))
        .where(storefrontVisible)
        .orderBy(products.categoryId, desc(products.publishedAt), desc(products.id), asc(productMedia.position)),
    ]);
    const totalByCategory = new Map(counts.map(({ categoryId, total }) => [categoryId, total]));
    const coverKeyByCategory = new Map(covers.map(({ categoryId, key }) => [categoryId, key]));

    return rows.map(({ id, slug }) => ({
      slug,
      productCount: totalByCategory.get(id) ?? 0,
      coverKey: coverKeyByCategory.get(id) ?? null,
    }));
  }
}

export namespace CategoryRepository {
  export type Category = { id: string; slug: string; grid: SizeGrid };
  export type ListItem = { id: string; name: string; grid: SizeGrid; active: boolean };
  export type StorefrontItem = { slug: string; productCount: number; coverKey: string | null };
}
