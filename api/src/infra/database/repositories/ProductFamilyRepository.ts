import { eq, sql } from 'drizzle-orm';

import { Injectable } from '@kernel/decorators/Injectable';
import type { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { productFamilies, products } from '@infra/database/drizzle/schema/catalog';

@Injectable()
export class ProductFamilyRepository {
  async create(id: string, tx: DrizzleClient.Transaction): Promise<void> {
    await tx.insert(productFamilies).values({ id });
  }

  // Família com uma cor só não tem o que trocar: apagá-la solta o último produto (a FK é `on delete set null`).
  async deleteIfAlone(id: string, tx: DrizzleClient.Transaction): Promise<void> {
    await tx
      .delete(productFamilies)
      .where(sql`${productFamilies.id} = ${id} and (select count(*) from ${products} where ${eq(products.familyId, id)}) <= 1`);
  }
}
