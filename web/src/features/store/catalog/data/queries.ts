import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { NEW_ARRIVALS_LIMIT, toNewArrivals } from '@/features/store/catalog/model/new-arrivals';
import { productHref } from '@/features/store/catalog/model/product-detail';
import type {
  Department,
  NewArrivals,
  ProductDetail,
  ProductReview,
  ProductSummary,
} from '@/features/store/catalog/model/types';
import { isRequestFailure } from '@/lib/http';
import { pendingRoute } from '@/lib/route';

import type { DepartmentDto, ProductDetailDto, ProductDto } from './api';
// PRÉVIA (não commitar): o catálogo de exemplo no lugar das rotas.
import { fetchDepartments, fetchNewestProducts, fetchProduct, fetchRecentReviews } from './preview-api';

function toDepartment({ slug, name, productCount, imageUrl }: DepartmentDto): Department {
  return { slug, name, productCount, imageUrl, href: pendingRoute(`/${slug}`) };
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

    return departments.map(toDepartment);
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

function toProductDetail(product: ProductDetailDto): ProductDetail {
  const { slug, title, brandName, department, category, ...detail } = product;

  return {
    ...detail,
    slug,
    name: title,
    brand: brandName,
    href: productHref(slug),
    department: { name: department.name, href: pendingRoute(`/${department.slug}`) },
    category: category && { name: category.name, href: pendingRoute(`/${department.slug}/${category.slug}`) },
  };
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
