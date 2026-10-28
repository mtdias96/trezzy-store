import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { CATALOG_PAGE_SIZE, type CatalogSort } from '@/features/store/catalog/model/listing';
import { NEW_ARRIVALS_LIMIT, toNewArrivals } from '@/features/store/catalog/model/new-arrivals';
import { productHref } from '@/features/store/catalog/model/product-detail';
import { type CatalogQuery, isSharedQuery } from '@/features/store/catalog/model/scope';
import {
  categoryHref,
  departmentHref,
  findCategory,
  findDepartment,
  STORE_DEPARTMENTS,
} from '@/features/store/catalog/model/taxonomy';
import type {
  CatalogResults,
  Department,
  NewArrivals,
  ProductDetail,
  ProductReview,
  ProductSummary,
} from '@/features/store/catalog/model/types';
import { isRequestFailure } from '@/lib/http';

import { type CatalogSortDto, type DepartmentDto, fetchCatalogPage, type ProductDetailDto, type ProductDto } from './api';
// PRÉVIA (não commitar): o catálogo de exemplo no lugar das rotas.
import { fetchDepartments, fetchNewestProducts, fetchProduct, fetchRecentReviews } from './preview-api';

// Na ordem e com os nomes da taxonomia. Departamento que a API não conhece fica de fora, e o que ela não manda
// (sem produto) também.
function toDepartments(departments: DepartmentDto[]): Department[] {
  return STORE_DEPARTMENTS.flatMap(({ slug, name }) => {
    const department = departments.find((item) => item.slug === slug);

    return department
      ? [{ slug, name, productCount: department.productCount, imageUrl: department.imageUrl, href: departmentHref(slug) }]
      : [];
  });
}

function toProductSummary(product: ProductDto): ProductSummary {
  const { id, slug, title, brandName, priceInCents, compareAtPriceInCents, installments, pixPriceInCents, rating, tag, coverUrl } = product;

  return {
    id,
    name: title,
    brand: brandName,
    href: productHref(slug),
    imageUrl: coverUrl,
    priceInCents,
    compareAtPriceInCents,
    installments,
    pixPriceInCents,
    rating,
    tag,
  };
}

export async function listDepartments(): Promise<Department[]> {
  'use cache';
  cacheTag('catalog');

  try {
    const departments = await fetchDepartments();

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

export async function getNewArrivals(): Promise<NewArrivals | null> {
  'use cache';
  cacheTag('catalog');

  const departments = await listDepartments();

  try {
    const [all, ...byDepartment] = await Promise.all([
      fetchNewestProducts({ limit: NEW_ARRIVALS_LIMIT }),
      ...departments.map(({ slug }) => fetchNewestProducts({ limit: NEW_ARRIVALS_LIMIT, department: slug })),
    ]);

    if (departments.length === 0) {
      cacheLife('minutes');
    } else {
      cacheLife('hours');
    }

    return toNewArrivals(
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

// Nomes da taxonomia na trilha. Categoria que ela não conhece sai da trilha: o link daria 404.
function toProductDetail(product: ProductDetailDto): ProductDetail {
  const { slug, title, brandName, department, category, ...detail } = product;
  const known = findDepartment(department.slug);
  const knownCategory = known && category ? findCategory(known, category.slug) : undefined;

  return {
    ...detail,
    slug,
    name: title,
    brand: brandName,
    href: productHref(slug),
    department: { name: known?.name ?? department.name, href: departmentHref(department.slug) },
    category: knownCategory ? { name: knownCategory.name, href: categoryHref(department.slug, knownCategory.slug) } : null,
  };
}

const API_SORT = {
  relevancia: 'relevance',
  novidades: 'newest',
  'mais-vendidos': 'best-selling',
  'menor-preco': 'price-asc',
  'maior-preco': 'price-desc',
} satisfies Record<CatalogSort, CatalogSortDto>;

async function fetchCatalogResults({ sort, ...query }: CatalogQuery): Promise<CatalogResults> {
  const { products, total, facets } = await fetchCatalogPage({ ...query, sort: API_SORT[sort], limit: CATALOG_PAGE_SIZE });

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
  cacheTag(`product:${slug}`);

  const product = await fetchProduct(slug);

  if (!product) {
    cacheLife('minutes');

    return null;
  }

  cacheLife('hours');

  return toProductDetail(product);
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
