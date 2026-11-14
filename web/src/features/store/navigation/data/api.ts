import 'server-only';

import * as z from 'zod';

import { http } from '@/lib/http';

const featuredProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  brandName: z.string(),
  priceInCents: z.number().int().positive(),
  coverUrl: z.url().nullable(),
});

export type FeaturedProductDto = z.infer<typeof featuredProductSchema>;

// GET /store/products?category={slugs}&sort=newest&limit={n} → { products }
// Sem curadoria no painel ainda: os destaques do departamento são os produtos mais novos dele.
export async function fetchFeaturedProducts(categories: readonly string[], limit: number): Promise<FeaturedProductDto[]> {
  const query = new URLSearchParams({ category: categories.join(','), sort: 'newest', limit: String(limit) });
  const { products } = await http(`/store/products?${query.toString()}`, {
    schema: z.object({ products: z.array(featuredProductSchema) }),
  });

  return products;
}
