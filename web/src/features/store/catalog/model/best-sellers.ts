import type { Route } from 'next';

import { serializeCatalogFilters } from './search-params';
import { ALL_PRODUCTS_HREF } from './taxonomy';

export const BEST_SELLERS_HREF = serializeCatalogFilters(ALL_PRODUCTS_HREF, { ordem: 'mais-vendidos' }) as Route;

export const BEST_SELLERS_LIMIT = 10;

const CARDS_PER_PAGE = 4;

export function railPageCount(products: number): number {
  return Math.max(1, Math.ceil(products / CARDS_PER_PAGE));
}

type RailPosition = {
  scrollLeft: number;
  clientWidth: number;
  scrollWidth: number;
};

// A última página pode ter menos cards que as outras: a trilha para antes de andar uma largura inteira, e por isso
// chegar ao fim dela conta como a última página, e não pelo arredondamento.
export function railPage({ scrollLeft, clientWidth, scrollWidth }: RailPosition, pageCount: number): number {
  const lastPage = pageCount - 1;

  return scrollLeft + clientWidth >= scrollWidth - 1 ? lastPage : Math.min(lastPage, Math.round(scrollLeft / clientWidth));
}

const padded = (value: number) => String(value).padStart(2, '0');

export function railPageLabel(page: number, pageCount: number): string {
  return `${padded(page + 1)} / ${padded(pageCount)}`;
}
