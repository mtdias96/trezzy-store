import { Suspense } from 'react';
import type { Metadata } from 'next';

import { PageSkeleton } from '@/components/common/feedback/page-skeleton';
import { ProductEditContainer } from '@/features/admin/products/containers/product-edit-container';

export const metadata: Metadata = {
  title: 'Editar produto',
};

export default function Page({ params }: PageProps<'/admin/produtos/[id]'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductEditContainer params={params} />
    </Suspense>
  );
}
