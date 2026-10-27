import 'server-only';

import * as z from 'zod';

import { http } from '@/lib/http';

// Contrato da rota pública da vitrine que o menu usa. Ainda não existe na API (web/AGENTS.md, Pendências).

const featuredProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  brandName: z.string(),
  priceInCents: z.number().int().positive(),
  coverUrl: z.url().nullable(),
});

export type FeaturedProductDto = z.infer<typeof featuredProductSchema>;

// GET /store/products?department={id}&featured=true&limit={n} → { products }
export async function fetchFeaturedProducts(department: string, limit: number): Promise<FeaturedProductDto[]> {
  const query = new URLSearchParams({ department, featured: 'true', limit: String(limit) });
  const { products } = await http(`/store/products?${query.toString()}`, {
    schema: z.object({ products: z.array(featuredProductSchema) }),
  });

  return products;
}
