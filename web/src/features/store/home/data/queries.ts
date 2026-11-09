import 'server-only';

import type { Route } from 'next';
import { cacheLife, cacheTag } from 'next/cache';

import type { HomeBanner } from '@/features/store/home/model/types';
import { isRequestFailure } from '@/lib/http';

import type { HomeBannerDto } from './api';
import { fetchHomeBanners } from './api';

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
