import 'server-only';

import * as z from 'zod';

import { http, HttpError } from '@/lib/http';

// Contrato das rotas públicas do catálogo da vitrine. Ainda não existem na API (web/AGENTS.md, Pendências).

// Vira parte da URL (/streetwear, /produtos/moletom-patio): só minúsculas, números e hífen.
const slugSchema = z.string().regex(/^[a-z0-9-]+$/);

// O name vem do painel, mas a vitrine mostra o de model/taxonomy.ts até a árvore da loja vir da API.
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
  // last-units e sold-out saem do estoque: a API escolhe um selo só.
  tag: z.enum(['drop', 'new', 'last-units', 'sold-out']).nullable(),
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

const countSchema = z.number().int().nonnegative();

const catalogPageSchema = z.object({
  products: z.array(productSchema),
  total: countSchema,
  facets: z.object({
    // Na ordem da grade (P, M, G… ou 37, 38…), só os tamanhos com estoque no recorte.
    sizes: z.array(z.object({ value: z.string(), count: countSchema })),
    // Todas as marcas ativas, inclusive as com zero no recorte.
    brands: z.array(z.object({ slug: slugSchema, name: z.string(), count: countSchema })),
  }),
});

export type CatalogPageDto = z.infer<typeof catalogPageSchema>;

export type CatalogSortDto = 'relevance' | 'newest' | 'best-selling' | 'price-asc' | 'price-desc';

export type CatalogPageQuery = {
  department: string | null;
  category: string | null;
  sizes: string[];
  brands: string[];
  priceAboveInCents: number | null;
  priceUpToInCents: number | null;
  onSale: boolean;
  sort: CatalogSortDto;
  page: number;
  limit: number;
};

// GET /store/products?department=&category=&size=M&size=G&brand=&priceAboveInCents=&priceUpToInCents=&onSale=true
//   &sort=relevance&page=1&limit=24 → { products, total, facets: { sizes, brands } }
// Preço: acima de priceAboveInCents (exclusivo) e até priceUpToInCents (inclusivo). Promoção: preço "de" maior que o
// preço. As contagens de cada filtro ignoram o próprio filtro: marcar uma marca não zera as outras.
export async function fetchCatalogPage(params: CatalogPageQuery): Promise<CatalogPageDto> {
  const { department, category, sizes, brands, priceAboveInCents, priceUpToInCents, onSale, sort, page, limit } = params;
  const query = new URLSearchParams({ sort, page: String(page), limit: String(limit) });

  if (department) {
    query.set('department', department);
  }

  if (category) {
    query.set('category', category);
  }

  if (priceAboveInCents !== null) {
    query.set('priceAboveInCents', String(priceAboveInCents));
  }

  if (priceUpToInCents !== null) {
    query.set('priceUpToInCents', String(priceUpToInCents));
  }

  if (onSale) {
    query.set('onSale', 'true');
  }

  sizes.forEach((size) => query.append('size', size));
  brands.forEach((brand) => query.append('brand', brand));

  return http(`/store/products?${query.toString()}`, { schema: catalogPageSchema });
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
