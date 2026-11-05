import { eq } from 'drizzle-orm';

import { Injectable } from '@kernel/decorators/Injectable';
import type { SizeGrid } from '@application/entities/sizeGrids';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { categories } from '@infra/database/drizzle/schema/catalog';

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
}

export namespace CategoryRepository {
  export type Category = { id: string; slug: string; grid: SizeGrid };
}
