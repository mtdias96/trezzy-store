'use client';

import { type ReactNode, useId, useTransition } from 'react';
import { useQueryStates } from 'nuqs';

import { FilterSheet } from '@/components/store/overlay/filter-sheet';
import { CatalogBrowser } from '@/features/store/catalog/components/listing/catalog-browser';
import { CatalogFilterPanel, type PanelFilters } from '@/features/store/catalog/components/listing/catalog-filter-panel';
import { SortSelect } from '@/features/store/catalog/components/listing/sort-select';
import { productCountLabel } from '@/features/store/catalog/model/departments';
import { activeFilterCount, CATALOG_LABELS } from '@/features/store/catalog/model/listing';
import type { DepartmentFilterItem } from '@/features/store/catalog/model/scope';
import { catalogParsers } from '@/features/store/catalog/model/search-params';
import type { BrandFacet } from '@/features/store/catalog/model/types';

type CatalogFiltersContainerProps = {
  departments: readonly DepartmentFilterItem[];
  sizes: readonly string[];
  brands: readonly BrandFacet[];
  total: number;
  children: ReactNode;
};

// shallow: false faz o servidor renderizar a lista de novo a cada filtro; a transição mantém a lista atual na tela
// até a nova chegar. Todo filtro volta para a primeira página.
export function CatalogFiltersContainer({ departments, sizes, brands, total, children }: CatalogFiltersContainerProps) {
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useQueryStates(catalogParsers, { shallow: false, startTransition });

  const change = (changes: Partial<PanelFilters>) => void setFilters({ ...changes, pagina: null });

  const panel = (idPrefix: string) => (
    <CatalogFilterPanel
      idPrefix={idPrefix}
      departments={departments}
      sizes={sizes}
      brands={brands}
      filters={filters}
      onChange={change}
    />
  );

  return (
    <CatalogBrowser
      busy={pending}
      toolbar={(
        <>
          <div className="lg:hidden">
            <FilterSheet
              triggerLabel={CATALOG_LABELS.filters}
              activeCount={activeFilterCount(filters)}
              doneLabel={`Ver ${productCountLabel(total)}`}
            >
              {panel(`${id}-sheet`)}
            </FilterSheet>
          </div>
          <SortSelect value={filters.ordem} onValueChange={(ordem) => void setFilters({ ordem, pagina: null })} />
        </>
      )}
      sidebar={panel(`${id}-side`)}
    >
      {children}
    </CatalogBrowser>
  );
}
