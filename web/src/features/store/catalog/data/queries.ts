import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { NEW_ARRIVALS_LIMIT, toNewArrivals } from '@/features/store/catalog/model/new-arrivals';
import type { Department, NewArrivals, ProductSummary } from '@/features/store/catalog/model/types';
import { isRequestFailure } from '@/lib/http';
import { pendingRoute } from '@/lib/route';

import {
  type DepartmentDto,
  fetchDepartments,
  fetchNewestProducts,
  type ProductDto,
} from './api';

function toDepartment({ slug, name, productCount, imageUrl }: DepartmentDto): Department {
  return { slug, name, productCount, imageUrl, href: pendingRoute(`/${slug}`) };
}

function toProductSummary(product: ProductDto): ProductSummary {
  const { id, slug, title, brandName, priceInCents, compareAtPriceInCents, installments, pixPriceInCents, rating, tag, coverUrl } = product;

  return {
    id,
    name: title,
    brand: brandName,
    href: pendingRoute(`/produtos/${slug}`),
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
