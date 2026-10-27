import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { departmentIds, toStoreMenu } from '@/features/store/navigation/model/nav';
import type { FeaturedProduct, StoreMenu } from '@/features/store/navigation/model/types';
import { isRequestFailure } from '@/lib/http';
import { pendingRoute } from '@/lib/route';

import type { FeaturedProductDto } from './api';
// PRÉVIA (não commitar): os dados de exemplo no lugar das rotas da vitrine.
import { fetchFeaturedProducts } from './preview-api';

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
  return { id, name: title, brand: brandName, priceInCents, href: pendingRoute(`/produtos/${slug}`), imageUrl: coverUrl };
}

// Conteúdo público, igual para todo visitante: entra no shell estático. Com falha, a entrada vale pouco, para o
// menu completo voltar logo; o 'minutes' ainda entra no prerender (expira em 1 h, acima do mínimo de 5 min).
export async function getStoreMenu(): Promise<StoreMenu> {
  'use cache';
  cacheTag('catalog');

  const ids = departmentIds();
  const featured = await Promise.all(ids.map((id) => orUndefined(fetchFeaturedProducts(id, FEATURED_PER_DEPARTMENT))));

  if (featured.includes(undefined)) {
    cacheLife('minutes');
  } else {
    cacheLife('hours');
  }

  return toStoreMenu(Object.fromEntries(ids.map((id, index) => [id, (featured[index] ?? []).map(toFeaturedProduct)])));
}
