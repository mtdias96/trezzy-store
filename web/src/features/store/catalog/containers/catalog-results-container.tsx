import { Pagination } from '@/components/store/navigation/pagination';
import { CatalogEmptyState } from '@/features/store/catalog/components/listing/catalog-empty-state';
import { ProductGrid } from '@/features/store/catalog/components/listing/product-grid';
import { listDepartments } from '@/features/store/catalog/data/queries';
import { activeFilterCount, type CatalogFilters, currentPage, sizeFilterOptions } from '@/features/store/catalog/model/listing';
import { type CatalogScope, departmentFilterItems, pageLinks } from '@/features/store/catalog/model/scope';
import type { CatalogResults } from '@/features/store/catalog/model/types';

import { CatalogFiltersContainer } from './catalog-filters-container';

type CatalogResultsContainerProps = {
  scope: CatalogScope;
  filters: Promise<CatalogFilters>;
  results: Promise<CatalogResults>;
};

// Os cards e a paginação são renderizados aqui, no servidor, e entram no container de client como children.
export async function CatalogResultsContainer({ scope, filters, results }: CatalogResultsContainerProps) {
  const [current, page, departments] = await Promise.all([filters, results, listDepartments()]);
  const links = pageLinks(scope, current, page.total);

  return (
    <CatalogFiltersContainer
      departments={departmentFilterItems(scope, departments)}
      sizes={sizeFilterOptions(page.sizes, current.tamanho)}
      brands={page.brands}
      total={page.total}
    >
      {page.products.length > 0
        ? (
            <div className="flex flex-col gap-8">
              <ProductGrid products={page.products} />
              <Pagination {...links} />
            </div>
          )
        : <CatalogEmptyState filtered={activeFilterCount(current) > 0 || currentPage(current.pagina) > 1} clearHref={scope.href} />}
    </CatalogFiltersContainer>
  );
}
