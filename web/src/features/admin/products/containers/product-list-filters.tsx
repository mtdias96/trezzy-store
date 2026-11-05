'use client';

import { useTransition } from 'react';
import { debounce, useQueryStates } from 'nuqs';

import type { FilterSelectOption } from '@/components/admin/forms/filter-select';
import { ProductListToolbar } from '@/features/admin/products/components/list/product-list-toolbar';
import type { StatusFilter, StockFilter } from '@/features/admin/products/model/list';
import { productListParsers } from '@/features/admin/products/model/search-params';

type ProductListFiltersProps = {
  brands: readonly FilterSelectOption[];
  categories: readonly FilterSelectOption[];
  statuses: readonly (FilterSelectOption & { value: StatusFilter })[];
  stockLevels: readonly (FilterSelectOption & { value: StockFilter })[];
};

// shallow: false faz o servidor renderizar a lista de novo a cada filtro; a transição mantém a lista atual na tela
// até a nova chegar.
export function ProductListFilters({ brands, categories, statuses, stockLevels }: ProductListFiltersProps) {
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useQueryStates(productListParsers, { shallow: false, startTransition });

  return (
    <ProductListToolbar
      filters={filters}
      brands={brands}
      categories={categories}
      statuses={statuses}
      stockLevels={stockLevels}
      onSearchChange={(busca) => void setFilters({ busca }, { limitUrlUpdates: debounce(300) })}
      onFiltersChange={(changes) => void setFilters(changes)}
    />
  );
}
