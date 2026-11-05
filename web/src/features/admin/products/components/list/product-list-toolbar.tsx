import Link from 'next/link';
import { PlusIcon } from 'lucide-react';

import { FilterMultiSelect, type FilterSelectOption, FilterSingleSelect } from '@/components/admin/forms/filter-select';
import { SearchField } from '@/components/admin/forms/search-field';
import { Button } from '@/components/ui/button';
import type {
  ProductListFilterChanges,
  ProductListFilters,
  StatusFilter,
  StockFilter,
} from '@/features/admin/products/model/list';

type ProductListToolbarProps = {
  filters: ProductListFilters;
  brands: readonly FilterSelectOption[];
  categories: readonly FilterSelectOption[];
  statuses: readonly (FilterSelectOption & { value: StatusFilter })[];
  stockLevels: readonly (FilterSelectOption & { value: StockFilter })[];
  onSearchChange: (busca: string) => void;
  onFiltersChange: (changes: ProductListFilterChanges) => void;
};

export function ProductListToolbar({
  filters,
  brands,
  categories,
  statuses,
  stockLevels,
  onSearchChange,
  onFiltersChange,
}: ProductListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SearchField
        aria-label="Buscar por nome ou SKU"
        placeholder="Buscar por nome ou SKU"
        value={filters.busca}
        onChange={(event) => onSearchChange(event.target.value)}
        className="lg:w-80"
      />
      <div className="flex flex-wrap items-center gap-2">
        <FilterMultiSelect
          label="Marca"
          allLabel="Todas"
          options={brands}
          value={filters.marca}
          onValueChange={(marca) => onFiltersChange({ marca })}
          searchPlaceholder="Buscar marca"
        />
        <FilterMultiSelect
          label="Categoria"
          allLabel="Todas"
          options={categories}
          value={filters.categoria}
          onValueChange={(categoria) => onFiltersChange({ categoria })}
        />
        <FilterSingleSelect
          label="Status"
          options={statuses}
          value={filters.status}
          onValueChange={(status) => onFiltersChange({ status })}
        />
        <FilterSingleSelect
          label="Estoque"
          options={stockLevels}
          value={filters.estoque}
          onValueChange={(estoque) => onFiltersChange({ estoque })}
        />
      </div>
      <Button
        size="lg"
        shape="pill"
        nativeButton={false}
        render={<Link href="/admin/produtos/novo" />}
        className="font-semibold lg:ml-auto"
      >
        <PlusIcon data-icon="inline-start" aria-hidden />
        Novo produto
      </Button>
    </div>
  );
}
