import type { ProductSummary, ProductTabs } from './types';

type DepartmentProducts = {
  slug: string;
  name: string;
  products: ProductSummary[];
};

export function toProductTabs(total: number, all: ProductSummary[], departments: DepartmentProducts[]): ProductTabs {
  const tabs = [
    { id: 'all', label: 'Tudo', products: all },
    ...departments.map(({ slug, name, products }) => ({ id: slug, label: name, products })),
  ];

  return { total, tabs: tabs.filter(({ products }) => products.length > 0) };
}
