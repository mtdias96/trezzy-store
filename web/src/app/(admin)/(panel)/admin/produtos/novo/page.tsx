import type { Metadata } from 'next';

import { ProductEditorView } from '@/features/admin/products/components/editor/product-editor-view';
import { ProductInfoFields } from '@/features/admin/products/components/editor/product-info-fields';
import { ProductOrganizationFields } from '@/features/admin/products/components/editor/product-organization-fields';
import { ProductPriceField } from '@/features/admin/products/components/editor/product-price-field';
import { ProductStatusField } from '@/features/admin/products/components/editor/product-status-field';
import { ProductSummary } from '@/features/admin/products/components/editor/product-summary';
import { ProductVariantsFields } from '@/features/admin/products/components/editor/product-variants-fields';
import { ProductMediaContainer } from '@/features/admin/products/containers/product-media-container';

export const metadata: Metadata = {
  title: 'Novo produto',
};

export default function Page() {
  return (
    <ProductEditorView
      main={(
        <>
          <ProductInfoFields />
          <ProductMediaContainer />
          <ProductVariantsFields />
        </>
      )}
      aside={(
        <>
          <ProductStatusField />
          <ProductOrganizationFields brands={[]} categories={[]} />
          <ProductPriceField />
          <ProductSummary />
        </>
      )}
    />
  );
}
