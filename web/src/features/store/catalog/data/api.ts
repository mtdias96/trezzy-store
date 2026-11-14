import 'server-only';

import * as z from 'zod';

import { http, HttpError } from '@/lib/http';

// Contrato das rotas públicas do catálogo da vitrine (`/store/*` na API). A API não conhece departamento: a vitrine
// pede pelas categorias do banco, que a taxonomia (model/taxonomy.ts) agrupa.

// Vira parte da URL (/roupas, /produtos/moletom-patio): só minúsculas, números e hífen.
const slugSchema = z.string().regex(/^[a-z0-9-]+$/);
const countSchema = z.number().int().nonnegative();
const centsSchema = z.number().int().positive();

// O HTTP API junta parâmetros repetidos com vírgula, e a API lê a lista assim.
function setList(query: URLSearchParams, name: string, values: readonly string[]) {
  if (values.length > 0) {
    query.set(name, values.join(','));
  }
}

const categorySchema = z.object({
  slug: slugSchema,
  // Produtos que a vitrine mostra. Categoria sem produto vem com zero.
  productCount: countSchema,
  // Capa do produto mais novo da categoria.
  coverUrl: z.url().nullable(),
});

export type CategoryDto = z.infer<typeof categorySchema>;

// GET /store/categories → { categories }: as categorias ativas do banco, sem nome (o nome é da taxonomia)
export async function fetchCategories(): Promise<CategoryDto[]> {
  const { categories } = await http('/store/categories', {
    schema: z.object({ categories: z.array(categorySchema) }),
  });

  return categories;
}

const productSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  title: z.string(),
  brandName: z.string(),
  // A variante ativa mais barata.
  priceInCents: centsSchema,
  installments: z.object({ count: z.number().int().positive(), valueInCents: centsSchema }),
  pixPriceInCents: centsSchema,
  coverUrl: z.url().nullable(),
  // A segunda foto da galeria, que entra no lugar da capa no hover do card. null: produto com uma foto só.
  hoverImageUrl: z.url().nullable(),
  // Os tamanhos da primeira cor com estoque, a que a página do produto abre selecionada, na ordem da grade (34–46,
  // PP–XGG ou U). variantId null: esgotado nessa cor. A variante que a barra do card põe na sacola sai daqui.
  sizeOptions: z.array(z.object({ size: z.string(), variantId: z.string().nullable() })),
});

export type ProductDto = z.infer<typeof productSchema>;

export type ProductQuery = {
  limit: number;
  // Sem categorias: a loja inteira.
  categories?: readonly string[];
};

export type ProductPage = {
  products: ProductDto[];
  total: number;
};

const productPageSchema = z.object({ products: z.array(productSchema), total: countSchema });

async function fetchProductPage(sort: CatalogSortDto, { limit, categories = [] }: ProductQuery): Promise<ProductPage> {
  const query = new URLSearchParams({ sort, limit: String(limit) });

  setList(query, 'category', categories);

  return http(`/store/products?${query.toString()}`, { schema: productPageSchema });
}

// GET /store/products?sort=newest&limit={n}[&category={slugs}] → { products, total }
export async function fetchNewestProducts(query: ProductQuery): Promise<ProductPage> {
  return fetchProductPage('newest', query);
}

// GET /store/products?sort=best-selling&limit={n}[&category={slugs}] → { products, total }
// Do mais vendido para o menos: a posição na lista é o número do ranking na home. Sem pedidos ainda, a API ordena
// como os mais novos.
export async function fetchBestSellers(query: ProductQuery): Promise<ProductPage> {
  return fetchProductPage('best-selling', query);
}

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
  // Sem categorias: a loja inteira.
  categories: readonly string[];
  sizes: readonly string[];
  brands: readonly string[];
  priceAboveInCents: number | null;
  priceUpToInCents: number | null;
  sort: CatalogSortDto;
  page: number;
  limit: number;
};

// GET /store/products?category=&size=M,G&brand=&priceAboveInCents=&priceUpToInCents=&sort=relevance&page=1&limit=24
//   → { products, total, facets: { sizes, brands } }
// Preço: acima de priceAboveInCents (exclusivo) e até priceUpToInCents (inclusivo). As contagens de cada filtro
// ignoram o próprio filtro: marcar uma marca não zera as outras.
export async function fetchCatalogPage(params: CatalogPageQuery): Promise<CatalogPageDto> {
  const { categories, sizes, brands, priceAboveInCents, priceUpToInCents, sort, page, limit } = params;
  const query = new URLSearchParams({ sort, page: String(page), limit: String(limit) });

  setList(query, 'category', categories);
  setList(query, 'size', sizes);
  setList(query, 'brand', brands);

  if (priceAboveInCents !== null) {
    query.set('priceAboveInCents', String(priceAboveInCents));
  }

  if (priceUpToInCents !== null) {
    query.set('priceUpToInCents', String(priceUpToInCents));
  }

  return http(`/store/products?${query.toString()}`, { schema: catalogPageSchema });
}

const productDetailSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  title: z.string(),
  // Texto puro, com parágrafos separados por linha em branco.
  description: z.string(),
  brandName: z.string(),
  // A categoria do banco: a taxonomia diz em que departamento ela fica.
  categorySlug: slugSchema,
  priceInCents: centsSchema,
  installments: z.object({ count: z.number().int().positive(), valueInCents: centsSchema }),
  pixPriceInCents: centsSchema,
  // Na ordem da galeria: a primeira é a capa.
  imageUrls: z.array(z.url()),
  // Os tamanhos das variantes ativas, na ordem da grade.
  sizes: z.array(z.string()),
  // Só as ativas, por cor e na ordem da grade. color '' = variante sem cor.
  variants: z.array(z.object({ id: z.string(), color: z.string(), size: z.string(), inStock: z.boolean() })),
});

export type ProductDetailDto = z.infer<typeof productDetailSchema>;

// GET /store/products/{slug} → { product }, ou 404 (inclusive rascunho, inativo e arquivado)
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

// GET /store/products/{slug}/reviews?limit={n} → { reviews }, das mais novas para as mais antigas. Ainda não existe na
// API: a página só a chama quando o produto tem avaliação, e hoje nenhum tem.
export async function fetchRecentReviews(slug: string, limit: number): Promise<ReviewDto[]> {
  const { reviews } = await http(`/store/products/${encodeURIComponent(slug)}/reviews?limit=${limit}`, {
    schema: z.object({ reviews: z.array(reviewSchema) }),
  });

  return reviews;
}

const brandSchema = z.object({
  slug: slugSchema,
  name: z.string(),
  productCount: countSchema,
  // O logo da marca.
  imageUrl: z.url().nullable(),
});

export type BrandDto = z.infer<typeof brandSchema>;

// GET /store/brands?limit={n} → { brands }: só marcas com produto, da que tem mais para a que tem menos (sem curadoria
// no painel ainda)
export async function fetchBrands(limit: number): Promise<BrandDto[]> {
  const { brands } = await http(`/store/brands?limit=${limit}`, {
    schema: z.object({ brands: z.array(brandSchema) }),
  });

  return brands;
}
