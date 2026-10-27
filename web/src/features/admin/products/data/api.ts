import 'server-only';

import { cache } from 'react';
import * as z from 'zod';

import type { MediaUploadInput } from '@/features/admin/products/model/schema';
import { authorizedHttp } from '@/features/shared/auth/session/authorized-http';
import { HttpError } from '@/lib/http';

// Contrato das rotas do catálogo no painel: a API responde com estes corpos (schema da api/: catalog.ts e media.ts).
// Todas exigem o scope de admin; leituras pedem `products:read`, e a mídia, `products:write`.

const variantSchema = z.object({
  id: z.string(),
  size: z.string(),
  color: z.string(),
  sku: z.string(),
  priceInCents: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
  active: z.boolean(),
});

const productSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']),
  brandId: z.string(),
  categoryId: z.string(),
  coverUrl: z.url().nullable(),
  variants: z.array(variantSchema),
  updatedAt: z.iso.datetime({ offset: true }),
});

const productSchema = productSummarySchema.omit({ coverUrl: true }).extend({
  description: z.string(),
  media: z.array(z.object({ id: z.string(), url: z.url() })),
});

const brandSchema = z.object({ id: z.string(), name: z.string(), active: z.boolean() });

const categorySchema = brandSchema.extend({ grid: z.enum(['num', 'apparel', 'one']) });

export type ProductSummaryDto = z.infer<typeof productSummarySchema>;
export type ProductDto = z.infer<typeof productSchema>;
export type BrandDto = z.infer<typeof brandSchema>;
export type CategoryDto = z.infer<typeof categorySchema>;

// GET /admin/products → { products }
export async function fetchProducts(): Promise<ProductSummaryDto[]> {
  const { products } = await authorizedHttp('/admin/products', {
    schema: z.object({ products: z.array(productSummarySchema) }),
  });

  return products;
}

// GET /admin/products/{id} → { product }, ou 404
export async function fetchProduct(id: string): Promise<ProductDto | null> {
  try {
    const { product } = await authorizedHttp(`/admin/products/${encodeURIComponent(id)}`, {
      schema: z.object({ product: productSchema }),
    });

    return product;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

// A lista e a edição pedem marcas e categorias na mesma renderização: uma chamada só por requisição.
// GET /admin/brands → { brands }
export const fetchBrands = cache(async (): Promise<BrandDto[]> => {
  const { brands } = await authorizedHttp('/admin/brands', { schema: z.object({ brands: z.array(brandSchema) }) });

  return brands;
});

// GET /admin/categories → { categories }
export const fetchCategories = cache(async (): Promise<CategoryDto[]> => {
  const { categories } = await authorizedHttp('/admin/categories', {
    schema: z.object({ categories: z.array(categorySchema) }),
  });

  return categories;
});

// POST /admin/media { contentType, sizeBytes } → { media: { id, uploadUrl } }: a URL pré-assinada do S3 para o PUT.
export async function createMediaUpload(input: MediaUploadInput): Promise<{ id: string; uploadUrl: string }> {
  const { media } = await authorizedHttp('/admin/media', {
    method: 'POST',
    body: input,
    schema: z.object({ media: z.object({ id: z.string(), uploadUrl: z.url() }) }),
  });

  return media;
}

// POST /admin/media/{id}/confirm → 204: a API confere o arquivo no S3 e marca o upload como concluído.
export async function confirmMediaUpload(id: string): Promise<void> {
  await authorizedHttp(`/admin/media/${encodeURIComponent(id)}/confirm`, { method: 'POST', schema: z.undefined() });
}
