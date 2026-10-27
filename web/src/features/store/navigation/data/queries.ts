import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { departmentIds, dropBadge, toStoreMenu } from '@/features/store/navigation/model/nav';
import type { DropTeaser, FeaturedProduct, StoreMenu } from '@/features/store/navigation/model/types';
import { isRequestFailure } from '@/lib/http';
import { pendingRoute } from '@/lib/route';

import { type DropDto, type FeaturedProductDto, fetchFeaturedProducts, fetchNextDrop } from './api';

const FEATURED_PER_DEPARTMENT = 2;

// A API fora do ar não derruba o header: o menu sai sem os destaques. undefined = a chamada falhou.
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

function toDropTeaser({ number, title, startsAt }: DropDto): DropTeaser {
  return { title, badge: dropBadge(number, new Date(startsAt)), startsAt, href: pendingRoute('/drops') };
}

// Conteúdo público, igual para todo visitante: entra no shell estático. Com falha, a entrada vale pouco, para o
// menu completo voltar logo; o 'minutes' ainda entra no prerender (expira em 1 h, acima do mínimo de 5 min).
export async function getStoreMenu(): Promise<StoreMenu> {
  'use cache';
  cacheTag('catalog', 'drops');

  const ids = departmentIds();
  const [featured, drop] = await Promise.all([
    Promise.all(ids.map((id) => orUndefined(fetchFeaturedProducts(id, FEATURED_PER_DEPARTMENT)))),
    orUndefined(fetchNextDrop()),
  ]);

  if (drop === undefined || featured.includes(undefined)) {
    cacheLife('minutes');
  } else {
    cacheLife('hours');
  }

  return toStoreMenu(
    Object.fromEntries(ids.map((id, index) => [id, (featured[index] ?? []).map(toFeaturedProduct)])),
    drop ? toDropTeaser(drop) : null,
  );
}
