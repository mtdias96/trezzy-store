import { Suspense } from 'react';
import type { Metadata } from 'next';

import { CatalogPageSkeleton } from '@/features/store/catalog/components/listing/catalog-skeleton';
import { CatalogContainer } from '@/features/store/catalog/containers/catalog-container';
import { categoryScope } from '@/features/store/catalog/model/scope';
import { STORE_DEPARTMENTS } from '@/features/store/catalog/model/taxonomy';

export function generateStaticParams() {
  return STORE_DEPARTMENTS.flatMap(({ slug, categories }) =>
    categories.map((category) => ({ department: slug, category: category.slug })));
}

export async function generateMetadata({ params }: PageProps<'/[department]/[category]'>): Promise<Metadata> {
  const { department, category } = await params;
  const scope = categoryScope(department, category);

  return scope ? { title: scope.metaTitle, description: scope.description } : { title: 'Página não encontrada' };
}

export default function Page({ params, searchParams }: PageProps<'/[department]/[category]'>) {
  return (
    <Suspense fallback={<CatalogPageSkeleton />}>
      {params.then(({ department, category }) => (
        <CatalogContainer scope={categoryScope(department, category)} searchParams={searchParams} />
      ))}
    </Suspense>
  );
}
