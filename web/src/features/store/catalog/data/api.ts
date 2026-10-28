import 'server-only';

import * as z from 'zod';

import { http } from '@/lib/http';

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
