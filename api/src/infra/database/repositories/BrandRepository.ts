import { eq } from 'drizzle-orm';

import { Injectable } from '@kernel/decorators/Injectable';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { brands } from '@infra/database/drizzle/schema/catalog';

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
}

export namespace BrandRepository {
  export type Brand = { id: string };
}
