import type { Route } from 'next';
import { io } from 'next/cache';
import type { SearchParams } from 'nuqs/server';

import { ProductTable } from '@/features/admin/products/components/list/product-table';
import { ProductsEmptyState } from '@/features/admin/products/components/list/products-empty-state';
import { ProductsView } from '@/features/admin/products/components/list/products-view';
import { listCategories, listProducts } from '@/features/admin/products/data/queries';
import {
  brandOptions,
  categoryOptions,
  filterProducts,
  formatCatalogSummary,
  nextSort,
  SORT_COLUMNS,
  type SortColumn,
  sortProducts,
  statusOptions,
  stockOptions,
} from '@/features/admin/products/model/list';
import { productListParamsCache, serializeProductListParams } from '@/features/admin/products/model/search-params';

import { ProductListFilters } from './product-list-filters';

const LIST_PATH = '/admin/produtos';

type ProductListContainerProps = {
  searchParams: Promise<SearchParams>;
};

// O catálogo do painel é pequeno: o Next filtra e ordena a lista inteira. Quando a API paginar, os mesmos
// parâmetros da URL vão para ela.
export async function ProductListContainer({ searchParams }: ProductListContainerProps) {
  const [filters, products, categories] = await Promise.all([
    productListParamsCache.parse(searchParams),
    listProducts(),
    listCategories(),
  ]);

  if (products.length === 0) {
    return (
      <ProductsView>
        <ProductsEmptyState />
      </ProductsView>
    );
  }

  await io();

  const sortLinks = Object.fromEntries(
    SORT_COLUMNS.map((column) => [column, serializeProductListParams(LIST_PATH, { ...filters, ordem: nextSort(filters.ordem, column) })]),
  ) as Record<SortColumn, Route>;

  return (
    <ProductsView summary={formatCatalogSummary(products)}>
      <ProductListFilters
        brands={brandOptions(products)}
        categories={categoryOptions(categories, products)}
        statuses={statusOptions(products)}
        stockLevels={stockOptions(products)}
      />
      <ProductTable
        products={sortProducts(filterProducts(products, filters), filters.ordem)}
        now={new Date()}
        sort={filters.ordem}
        sortLinks={sortLinks}
        clearFiltersHref={serializeProductListParams(LIST_PATH, { ordem: filters.ordem }) as Route}
      />
    </ProductsView>
  );
}
