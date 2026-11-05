import { Suspense } from 'react';
import type { Metadata } from 'next';

import { CatalogPageSkeleton } from '@/features/store/catalog/components/listing/catalog-skeleton';
import { CatalogContainer } from '@/features/store/catalog/containers/catalog-container';
import { departmentScope } from '@/features/store/catalog/model/scope';
import { STORE_DEPARTMENTS } from '@/features/store/catalog/model/taxonomy';

export function generateStaticParams() {
  return STORE_DEPARTMENTS.map(({ slug }) => ({ department: slug }));
}

export async function generateMetadata({ params }: PageProps<'/[department]'>): Promise<Metadata> {
  const scope = departmentScope((await params).department);

  return scope ? { title: scope.metaTitle, description: scope.description } : { title: 'Página não encontrada' };
}

// O params é lido dentro do Suspense (Partial Prefetching): os departamentos da taxonomia saem prontos do build, e
// uma URL desconhecida responde 200 com noindex, porque o streaming já começou quando o notFound() roda.
export default function Page({ params, searchParams }: PageProps<'/[department]'>) {
  return (
    <Suspense fallback={<CatalogPageSkeleton />}>
      {params.then(({ department }) => (
        <CatalogContainer scope={departmentScope(department)} searchParams={searchParams} />
      ))}
    </Suspense>
  );
}
