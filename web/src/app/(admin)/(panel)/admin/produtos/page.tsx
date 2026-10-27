import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ProductsListSkeleton } from '@/features/admin/products/components/list/products-list-skeleton';
import { ProductListContainer } from '@/features/admin/products/containers/product-list-container';

export const metadata: Metadata = {
  title: 'Produtos',
};

export default function Page({ searchParams }: PageProps<'/admin/produtos'>) {
  return (
    <Suspense fallback={<ProductsListSkeleton />}>
      <ProductListContainer searchParams={searchParams} />
    </Suspense>
  );
}
