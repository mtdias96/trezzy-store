import 'server-only';

import type { Route } from 'next';
import { cacheLife, cacheTag } from 'next/cache';

import { storeNav, toStoreMenu } from '@/features/store/navigation/model/nav';
import type { FeaturedProduct, MenuDepartment, StoreMenu } from '@/features/store/navigation/model/types';
import { isRequestFailure } from '@/lib/http';

import { type FeaturedProductDto, fetchFeaturedProducts } from './api';

const FEATURED_PER_DEPARTMENT = 2;

// A API fora do ar não derruba o header: o departamento abre sem os destaques. undefined = a chamada falhou.
async function orUndefined<T>(request: Promise<T>): Promise<T | undefined> {
  try {
    return await request;
  } catch (error) {
    if (isRequestFailure(error)) {
      return undefined;
    }

    throw error;
  }
}

function toFeaturedProduct({ id, slug, title, brandName, priceInCents, coverUrl }: FeaturedProductDto): FeaturedProduct {
  // O typedRoutes não prova o formato do slug numa string qualquer; o schema da API só aceita minúsculas e hífen.
  return { id, name: title, brand: brandName, priceInCents, href: `/produtos/${slug}` as Route, imageUrl: coverUrl };
}

// Conteúdo público, igual para todo visitante: entra no shell estático. Com falha, a entrada vale pouco, para o
// menu completo voltar logo; o 'minutes' ainda entra no prerender (expira em 1 h, acima do mínimo de 5 min).
export async function getStoreMenu(departments: readonly MenuDepartment[]): Promise<StoreMenu> {
  'use cache';
  cacheTag('catalog');

  // Só os departamentos do catálogo têm destaques: o painel de Marcas abre sem produtos.
  const featured = await Promise.all(
    departments.map(({ categorySlugs }) => orUndefined(fetchFeaturedProducts(categorySlugs, FEATURED_PER_DEPARTMENT))),
  );

  if (featured.includes(undefined)) {
    cacheLife('minutes');
  } else {
    cacheLife('hours');
  }

  return toStoreMenu(
    storeNav(departments),
    Object.fromEntries(departments.map(({ id }, index) => [id, (featured[index] ?? []).map(toFeaturedProduct)])),
  );
}
