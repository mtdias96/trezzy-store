import { Suspense } from 'react';
import type { Metadata } from 'next';

import { PageSkeleton } from '@/components/common/feedback/page-skeleton';
import { ProductNewContainer } from '@/features/admin/products/containers/product-new-container';

export const metadata: Metadata = {
  title: 'Novo produto',
};

export default function Page({ searchParams }: PageProps<'/admin/produtos/novo'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductNewContainer searchParams={searchParams} />
    </Suspense>
  );
}
