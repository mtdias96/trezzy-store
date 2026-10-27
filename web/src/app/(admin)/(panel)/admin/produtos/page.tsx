import type { Metadata } from 'next';

import { ProductsEmptyState } from '@/features/admin/products/components/list/products-empty-state';
import { ProductsView } from '@/features/admin/products/components/list/products-view';

export const metadata: Metadata = {
  title: 'Produtos',
};

export default function Page() {
  return (
    <ProductsView>
      <ProductsEmptyState />
    </ProductsView>
  );
}
