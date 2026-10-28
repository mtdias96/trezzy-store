import 'server-only';

import * as z from 'zod';

import { http, HttpError } from '@/lib/http';

// Contrato das rotas públicas do catálogo da vitrine. Ainda não existem na API (web/AGENTS.md, Pendências).

// Vira parte da URL (/streetwear, /produtos/moletom-patio): só minúsculas, números e hífen.
const slugSchema = z.string().regex(/^[a-z0-9-]+$/);

const departmentSchema = z.object({
  slug: slugSchema,
  name: z.string(),
  productCount: z.number().int().nonnegative(),
  imageUrl: z.url().nullable(),
});

export type DepartmentDto = z.infer<typeof departmentSchema>;

// GET /store/departments → { departments }, na ordem da vitrine
export async function fetchDepartments(): Promise<DepartmentDto[]> {
  const { departments } = await http('/store/departments', {
    schema: z.object({ departments: z.array(departmentSchema) }),
  });

  return departments;
}

const productSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  title: z.string(),
  brandName: z.string(),
  priceInCents: z.number().int().positive(),
  compareAtPriceInCents: z.number().int().positive().nullable(),
  installments: z.object({ count: z.number().int().positive(), valueInCents: z.number().int().positive() }).nullable(),
  pixPriceInCents: z.number().int().positive().nullable(),
  rating: z.number().min(0).max(5).nullable(),
  tag: z.enum(['drop', 'new', 'last-units']).nullable(),
  coverUrl: z.url().nullable(),
});

export type ProductDto = z.infer<typeof productSchema>;

export type ProductQuery = {
  limit: number;
  department?: string;
};

export type ProductPage = {
  products: ProductDto[];
  total: number;
};

// GET /store/products?sort=newest&limit={n}[&department={slug}] → { products, total }
export async function fetchNewestProducts({ limit, department }: ProductQuery): Promise<ProductPage> {
  const query = new URLSearchParams({ sort: 'newest', limit: String(limit) });

  if (department) {
    query.set('department', department);
  }

  return http(`/store/products?${query.toString()}`, {
    schema: z.object({ products: z.array(productSchema), total: z.number().int().nonnegative() }),
  });
}

const productDetailSchema = productSchema.omit({ coverUrl: true }).extend({
  description: z.array(z.string()),
  composition: z.array(z.string()),
  reviewCount: z.number().int().nonnegative(),
  reviewSummary: z.object({
    // Quantas avaliações com 5, 4, 3, 2 e 1 estrela, nessa ordem.
    distribution: z.tuple([z.number().int(), z.number().int(), z.number().int(), z.number().int(), z.number().int()]),
    fit: z.enum(['small', 'true-to-size', 'large']).nullable(),
  }),
  department: z.object({ slug: slugSchema, name: z.string() }),
  category: z.object({ slug: slugSchema, name: z.string() }).nullable(),
  images: z.array(z.object({ url: z.url(), alt: z.string() })),
  colors: z.array(z.object({ id: z.string(), name: z.string(), swatch: z.enum(['black', 'white', 'off-white', 'heather-gray', 'green']) })),
  sizes: z.array(z.string()),
  variants: z.array(z.object({ id: z.string(), colorId: z.string(), size: z.string(), inStock: z.boolean() })),
  sizeChart: z.object({ headers: z.array(z.string()), rows: z.array(z.array(z.string())) }).nullable(),
});

export type ProductDetailDto = z.infer<typeof productDetailSchema>;

// GET /store/products/{slug} → { product }, ou 404
export async function fetchProduct(slug: string): Promise<ProductDetailDto | null> {
  try {
    const { product } = await http(`/store/products/${encodeURIComponent(slug)}`, {
      schema: z.object({ product: productDetailSchema }),
    });

    return product;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

const reviewSchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string(),
  body: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  size: z.string().nullable(),
  verified: z.boolean(),
  author: z.string(),
  location: z.string().nullable(),
});

export type ReviewDto = z.infer<typeof reviewSchema>;

// GET /store/products/{slug}/reviews?limit={n} → { reviews }, das mais novas para as mais antigas
export async function fetchRecentReviews(slug: string, limit: number): Promise<ReviewDto[]> {
  const { reviews } = await http(`/store/products/${encodeURIComponent(slug)}/reviews?limit=${limit}`, {
    schema: z.object({ reviews: z.array(reviewSchema) }),
  });

  return reviews;
}
