import 'server-only';

import type { Route } from 'next';
import { cacheLife, cacheTag } from 'next/cache';

import { COLLECTION_TILES, toHomeCollections } from '@/features/store/home/model/collections';
import type { HomeBanner, HomeCollection, HomeCollections } from '@/features/store/home/model/types';
import { isRequestFailure } from '@/lib/http';

import type { HomeBannerDto, HomeCollectionDto } from './api';
import { fetchHomeBanners, fetchHomeCollections } from './api';

// O link vem do painel, e o typedRoutes só checa literal: o schema já garante que é um caminho interno.
function toBanner({ id, imageUrl, imageAlt, href }: HomeBannerDto): HomeBanner {
  return { id, imageUrl, imageAlt, href: href as Route };
}

export async function getHomeBanners(): Promise<HomeBanner[]> {
  'use cache';
  cacheTag('banners');

  try {
    const banners = await fetchHomeBanners();

    cacheLife('hours');

    return banners.map(toBanner);
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    cacheLife('minutes');

    return [];
  }
}

function toCollection({ href, ...collection }: HomeCollectionDto): HomeCollection {
  return { ...collection, href: href as Route };
}

export async function getHomeCollections(): Promise<HomeCollections | null> {
  'use cache';
  cacheTag('collections');

  try {
    const collections = await fetchHomeCollections();

    cacheLife('hours');

    return toHomeCollections(collections.slice(0, COLLECTION_TILES).map(toCollection));
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    cacheLife('minutes');

    return null;
  }
}
