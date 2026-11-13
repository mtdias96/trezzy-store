import { count, eq } from 'drizzle-orm';

import { Injectable } from '@kernel/decorators/Injectable';
import { storefrontVisible } from '@infra/database/drizzle/conditions/storefrontVisible';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { brands, categories, products } from '@infra/database/drizzle/schema/catalog';
import { media } from '@infra/database/drizzle/schema/media';

@Injectable()
export class BrandRepository {
  constructor(private readonly drizzle: DrizzleClient) {}

  async findById(id: string): Promise<BrandRepository.Brand | null> {
    const [brand] = await this.drizzle.db
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);

    return brand ?? null;
  }

  async findAll(): Promise<BrandRepository.ListItem[]> {
    return this.drizzle.db
      .select({ id: brands.id, name: brands.name, active: brands.active })
      .from(brands);
  }

  // Só marcas ativas com produto visível na vitrine, com a contagem e o logo.
  async findStorefront(): Promise<BrandRepository.StorefrontItem[]> {
    return this.drizzle.db
      .select({ slug: brands.slug, name: brands.name, logoKey: media.key, productCount: count() })
      .from(products)
      .innerJoin(brands, eq(brands.id, products.brandId))
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(media, eq(media.id, brands.logoMediaId))
      .where(storefrontVisible)
      .groupBy(brands.id, media.key);
  }
}

export namespace BrandRepository {
  export type Brand = { id: string };
  export type ListItem = { id: string; name: string; active: boolean };
  export type StorefrontItem = { slug: string; name: string; logoKey: string | null; productCount: number };
}
