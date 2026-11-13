import { and, eq, sql } from 'drizzle-orm';

import { brands, categories, products, productVariants } from '@infra/database/drizzle/schema/catalog';

// Produto que a vitrine mostra: ativo, de marca e categoria ativas e com uma variante ativa (sem ela não há preço).
// A query precisa juntar `brands` e `categories`.
export const storefrontVisible = and(
  eq(products.status, 'active'),
  eq(brands.active, true),
  eq(categories.active, true),
  sql`exists (select 1 from ${productVariants} where ${productVariants.productId} = ${products.id} and ${productVariants.active})`,
);
