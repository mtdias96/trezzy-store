import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { SearchParams } from 'nuqs/server';

import { CatalogCount } from '@/features/store/catalog/components/listing/catalog-count';
import { CatalogCountSkeleton, CatalogResultsSkeleton } from '@/features/store/catalog/components/listing/catalog-skeleton';
import { CatalogView } from '@/features/store/catalog/components/listing/catalog-view';
import { getCatalogResults } from '@/features/store/catalog/data/queries';
import { type CatalogScope, toCatalogQuery } from '@/features/store/catalog/model/scope';
import { loadCatalogFilters } from '@/features/store/catalog/model/search-params';
import type { CatalogResults } from '@/features/store/catalog/model/types';

import { CatalogResultsContainer } from './catalog-results-container';

type CatalogContainerProps = {
  // null: a URL não é de nenhuma página do catálogo.
  scope: CatalogScope | null;
  searchParams: Promise<SearchParams>;
};

async function CountContainer({ results }: { results: Promise<CatalogResults> }) {
  const { total } = await results;

  return <CatalogCount total={total} />;
}

// O total no topo e a lista leem a mesma consulta: a promessa nasce uma vez aqui, sem await, e cada Suspense a
// espera. Assim o topo continua no HTML estático, e a API é chamada uma vez por requisição.
export function CatalogContainer({ scope, searchParams }: CatalogContainerProps) {
  if (!scope) {
    notFound();
  }

  const filters = loadCatalogFilters(searchParams);
  const results = filters.then((current) => getCatalogResults(toCatalogQuery(scope, current)));

  return (
    <CatalogView
      scope={scope}
      count={(
        <Suspense fallback={<CatalogCountSkeleton />}>
          <CountContainer results={results} />
        </Suspense>
      )}
    >
      <Suspense fallback={<CatalogResultsSkeleton />}>
        <CatalogResultsContainer scope={scope} filters={filters} results={results} />
      </Suspense>
    </CatalogView>
  );
}
