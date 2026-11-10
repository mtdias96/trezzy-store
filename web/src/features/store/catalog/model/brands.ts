import type { Route } from 'next';

import { serializeCatalogFilters } from './search-params';
import { ALL_PRODUCTS_HREF } from './taxonomy';
import type { BrandTile } from './types';

export const BRAND_TILES = 8;

export function brandHref(slug: string): Route {
  return serializeCatalogFilters(ALL_PRODUCTS_HREF, { marca: [slug] }) as Route;
}

// A grade é desenhada para oito marcas, e o texto da seção diz "oito": com menos, a seção some.
export function toBrandShowcase(brands: readonly BrandTile[]): BrandTile[] | null {
  return brands.length >= BRAND_TILES ? brands.slice(0, BRAND_TILES) : null;
}
