import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { BEST_SELLERS_LIMIT } from '@/features/store/catalog/model/best-sellers';
import { BRAND_TILES, brandHref, toBrandShowcase } from '@/features/store/catalog/model/brands';
import { CATALOG_PAGE_SIZE, type CatalogSort, PRICE_RANGES } from '@/features/store/catalog/model/listing';
import { NEW_ARRIVALS_LIMIT } from '@/features/store/catalog/model/new-arrivals';
import { PRICE_BAND_PHOTOS, toPriceBands } from '@/features/store/catalog/model/price-bands';
import { productHref } from '@/features/store/catalog/model/product-detail';
import { toProductTabs } from '@/features/store/catalog/model/product-tabs';
import { type CatalogQuery, isSharedQuery } from '@/features/store/catalog/model/scope';
import {
  categoryHref,
  departmentCategorySlugs,
  departmentHref,
  findCategoryPlace,
  findDepartment,
  STORE_DEPARTMENTS,
} from '@/features/store/catalog/model/taxonomy';
import type {
  BrandTile,
  CatalogResults,
  Department,
  OutletShowcase,
  PriceBand,
  ProductDetail,
  ProductReview,
  ProductSummary,
  ProductTabs,
} from '@/features/store/catalog/model/types';
import { colorLabel, colorSuggestionOf } from '@/lib/color';
import { isRequestFailure } from '@/lib/http';
import { paragraphs } from '@/lib/text';

import {
  type CatalogSortDto,
  type CategoryDto,
  fetchBestSellers,
  fetchBrands,
  fetchCatalogPage,
  fetchCategories,
  fetchNewestProducts,
  fetchProduct,
  fetchRecentReviews,
  type ProductDetailDto,
  type ProductDto,
  type ProductPage,
  type ProductQuery,
} from './api';

// Na ordem e com os nomes da taxonomia, somando as categorias do banco de cada departamento. A capa é a da primeira
// categoria (na ordem da taxonomia) que tem foto. Departamento sem produto fica de fora.
function toDepartments(categories: CategoryDto[]): Department[] {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));

  return STORE_DEPARTMENTS.flatMap((department) => {
    const sources = departmentCategorySlugs(department).flatMap((slug) => bySlug.get(slug) ?? []);
    const productCount = sources.reduce((sum, { productCount: count }) => sum + count, 0);

    return productCount > 0
      ? [{
          slug: department.slug,
          name: department.name,
          productCount,
          imageUrl: sources.find(({ coverUrl }) => coverUrl !== null)?.coverUrl ?? null,
          href: departmentHref(department.slug),
          categories: department.categories.map((category) => ({
            slug: category.slug,
            name: category.name,
            href: categoryHref(department.slug, category.slug),
            productCount: bySlug.get(category.slug)?.productCount ?? 0,
          })),
        }]
      : [];
  });
}

// A API ainda não tem preço "de" nem avaliação: o card sai sem o riscado e sem a nota.
function toProductSummary(product: ProductDto): ProductSummary {
  const { id, slug, title, brandName, priceInCents, installments, pixPriceInCents, coverUrl, hoverImageUrl, sizeOptions } = product;

  return {
    id,
    name: title,
    brand: brandName,
    href: productHref(slug),
    imageUrl: coverUrl,
    hoverImageUrl,
    priceInCents,
    compareAtPriceInCents: null,
    installments,
    pixPriceInCents,
    rating: null,
    sizeOptions,
  };
}

function categoriesOf(departmentSlug: string): string[] {
  const department = findDepartment(departmentSlug);

  return department ? departmentCategorySlugs(department) : [];
}

export async function listDepartments(): Promise<Department[]> {
  'use cache';
  cacheTag('catalog');

  try {
    const departments = await fetchCategories();

    cacheLife('hours');

    return toDepartments(departments);
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    cacheLife('minutes');

    return [];
  }
}

// Chamada de dentro de um 'use cache': o cacheLife vale para a entrada de quem chamou.
async function fetchProductTabs(fetchPage: (query: ProductQuery) => Promise<ProductPage>, limit: number): Promise<ProductTabs | null> {
  const departments = await listDepartments();

  try {
    const [all, ...byDepartment] = await Promise.all([
      fetchPage({ limit }),
      ...departments.map(({ slug }) => fetchPage({ limit, categories: categoriesOf(slug) })),
    ]);

    if (departments.length === 0) {
      cacheLife('minutes');
    } else {
      cacheLife('hours');
    }

    return toProductTabs(
      all.total,
      all.products.map(toProductSummary),
      departments.map(({ slug, name }, index) => ({
        slug,
        name,
        products: (byDepartment[index]?.products ?? []).map(toProductSummary),
      })),
    );
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    cacheLife('minutes');

    return null;
  }
}

export async function getNewArrivals(): Promise<ProductTabs | null> {
  'use cache';
  cacheTag('catalog');

  return fetchProductTabs(fetchNewestProducts, NEW_ARRIVALS_LIMIT);
}

export async function getWeeklyBestSellers(): Promise<ProductTabs | null> {
  'use cache';
  cacheTag('catalog');

  return fetchProductTabs(fetchBestSellers, BEST_SELLERS_LIMIT);
}

// Sem preço "de" na API, nenhum produto está em promoção: o Outlet da home e o selo de desconto do "Compre por peça"
// ficam de fora até a coluna existir.
export function getOutletShowcase(): Promise<OutletShowcase | null> {
  return Promise.resolve(null);
}

export async function getFeaturedBrands(): Promise<BrandTile[] | null> {
  'use cache';
  cacheTag('catalog');

  try {
    const brands = await fetchBrands(BRAND_TILES);

    cacheLife('hours');

    return toBrandShowcase(brands.map((brand) => ({ ...brand, href: brandHref(brand.slug) })));
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    cacheLife('minutes');

    return null;
  }
}

// Uma consulta por faixa, à mesma rota da listagem: a contagem do card é a mesma que a página mostra ao abrir.
export async function getPriceBands(): Promise<PriceBand[]> {
  'use cache';
  cacheTag('catalog');

  try {
    const results = await Promise.all(PRICE_RANGES.map(async (range) => {
      const { products, total } = await fetchCatalogPage({
        categories: [],
        sizes: [],
        brands: [],
        priceAboveInCents: range.aboveInCents,
        priceUpToInCents: range.upToInCents,
        sort: 'best-selling',
        page: 1,
        limit: PRICE_BAND_PHOTOS,
      });

      return { range, total, photos: products.map(({ id, coverUrl }) => ({ id, imageUrl: coverUrl })) };
    }));

    cacheLife('hours');

    return toPriceBands(results);
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    cacheLife('minutes');

    return [];
  }
}

// Nomes da taxonomia na trilha. Produto de uma categoria que a vitrine não mostra responde como inexistente. Sem
// avaliações, composição e tabela de medidas na API, a página sai sem essas partes.
function toProductDetail(product: ProductDetailDto): ProductDetail | null {
  const { id, slug, title, description, brandName, categorySlug, imageUrls, sizes, variants, colorName, colorways, ...prices } = product;
  const place = findCategoryPlace(categorySlug);

  if (!place) {
    return null;
  }

  const { department, category } = place;
  const colors = [...new Set(variants.map(({ color }) => color))].filter((color) => color !== '');

  return {
    ...prices,
    id,
    slug,
    name: title,
    brand: brandName,
    href: productHref(slug),
    compareAtPriceInCents: null,
    rating: null,
    description: paragraphs(description),
    composition: [],
    reviewCount: 0,
    reviewSummary: { distribution: [0, 0, 0, 0, 0], fit: null },
    department: { name: department.name, href: departmentHref(department.slug) },
    category: category ? { name: category.name, href: categoryHref(department.slug, category.slug) } : null,
    images: imageUrls.map((url, index) => ({ url, alt: index === 0 ? title : `${title}, foto ${index + 1}` })),
    colors: colors.map((color) => ({ id: color, name: colorLabel(color), swatch: colorSuggestionOf(color)?.swatch ?? null })),
    sizes,
    variants: variants.map(({ id: variantId, color, size, inStock }) => ({ id: variantId, colorId: color, size, inStock })),
    sizeChart: null,
    colorName,
    colorways: colorways.map(({ slug: colorwaySlug, colorName: name, coverUrl, inStock, current }) => ({
      name,
      href: productHref(colorwaySlug),
      imageUrl: coverUrl,
      inStock,
      current,
    })),
  };
}

const API_SORT = {
  relevancia: 'relevance',
  novidades: 'newest',
  'mais-vendidos': 'best-selling',
  'menor-preco': 'price-asc',
  'maior-preco': 'price-desc',
} satisfies Record<CatalogSort, CatalogSortDto>;

async function fetchCatalogResults({ department, category, sort, ...query }: CatalogQuery): Promise<CatalogResults> {
  const categories = category ? [category] : department ? categoriesOf(department) : [];
  const { products, total, facets } = await fetchCatalogPage({ ...query, categories, sort: API_SORT[sort], limit: CATALOG_PAGE_SIZE });

  return { products: products.map(toProductSummary), total, sizes: facets.sizes, brands: facets.brands };
}

// 'use cache: remote': a mesma página é pedida por todo visitante e pelo prefetch dos links, em qualquer instância
// da Vercel. Minutos, e não horas: o estoque (esgotado, tamanhos) muda com os pedidos, fora de qualquer action do Next.
async function getSharedCatalogResults(query: CatalogQuery): Promise<CatalogResults> {
  'use cache: remote';
  cacheTag('catalog');
  cacheLife('minutes');

  return fetchCatalogResults(query);
}

// Com filtro, a combinação quase não se repete: o cache remoto só somaria a latência da consulta a ele (a própria doc
// do Next desaconselha cachear filtros e faixas de preço), e a busca vai direto à API. Falha da API vai para o
// error.tsx: sem a lista, a página não tem o que mostrar.
export async function getCatalogResults(query: CatalogQuery): Promise<CatalogResults> {
  return isSharedQuery(query) ? getSharedCatalogResults(query) : fetchCatalogResults(query);
}

// 'use cache: remote': slug lido em runtime, cache compartilhado entre as instâncias da Vercel. Falha da API vai
// para o error.tsx, e não vira 404: um 404 por API fora do ar tiraria o produto do Google.
export async function getProduct(slug: string): Promise<ProductDetail | null> {
  'use cache: remote';
  // `catalog` também: a página lista as outras cores do modelo, e o painel invalida essa tag ao ligar ou cadastrar uma.
  cacheTag(`product:${slug}`, 'catalog');

  const dto = await fetchProduct(slug);
  const product = dto && toProductDetail(dto);

  if (!product) {
    cacheLife('minutes');

    return null;
  }

  cacheLife('hours');

  return product;
}

const RECENT_REVIEWS = 3;

// Com a API fora do ar, a lista sai vazia: avaliação não pode derrubar a compra.
export async function getRecentReviews(slug: string): Promise<ProductReview[]> {
  'use cache: remote';
  cacheTag(`reviews:${slug}`);

  try {
    const reviews = await fetchRecentReviews(slug, RECENT_REVIEWS);

    cacheLife('hours');

    return reviews;
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    cacheLife('minutes');

    return [];
  }
}
