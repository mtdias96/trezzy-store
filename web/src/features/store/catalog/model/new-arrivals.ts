import { pendingRoute } from '@/lib/route';

import type { NewArrivals, ProductSummary } from './types';

export const NEW_ARRIVALS_HREF = pendingRoute('/novidades');

export const NEW_ARRIVALS_LIMIT = 8;

type DepartmentProducts = {
  slug: string;
  name: string;
  products: ProductSummary[];
};

export function toNewArrivals(total: number, all: ProductSummary[], departments: DepartmentProducts[]): NewArrivals {
  const tabs = [
    { id: 'all', label: 'Tudo', products: all },
    ...departments.map(({ slug, name, products }) => ({ id: slug, label: name, products })),
  ];

  return { total, tabs: tabs.filter(({ products }) => products.length > 0) };
}
