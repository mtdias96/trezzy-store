import 'server-only';

import * as z from 'zod';

import { http, HttpError } from '@/lib/http';

// Contrato das rotas públicas da vitrine que o menu usa. Ainda não existem na API (web/AGENTS.md, Pendências).

const featuredProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  brandName: z.string(),
  priceInCents: z.number().int().positive(),
  coverUrl: z.url().nullable(),
});

const dropSchema = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
});

export type FeaturedProductDto = z.infer<typeof featuredProductSchema>;
export type DropDto = z.infer<typeof dropSchema>;

// GET /store/products?department={id}&featured=true&limit={n} → { products }
export async function fetchFeaturedProducts(department: string, limit: number): Promise<FeaturedProductDto[]> {
  const query = new URLSearchParams({ department, featured: 'true', limit: String(limit) });
  const { products } = await http(`/store/products?${query.toString()}`, {
    schema: z.object({ products: z.array(featuredProductSchema) }),
  });

  return products;
}

// GET /store/drops/next → { drop }, ou 404 quando não há drop marcado
export async function fetchNextDrop(): Promise<DropDto | null> {
  try {
    const { drop } = await http('/store/drops/next', { schema: z.object({ drop: dropSchema }) });

    return drop;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
