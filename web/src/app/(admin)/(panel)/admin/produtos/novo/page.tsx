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

// PRÉVIA (não commitar): marcas e categorias de exemplo, até a API listá-las.
const PREVIEW_BRANDS = [
  { value: 'trezzy', label: 'Trezzy' },
  { value: 'nike', label: 'Nike' },
  { value: 'adidas', label: 'Adidas' },
  { value: 'new-balance', label: 'New Balance' },
  { value: 'vans', label: 'Vans' },
];

const PREVIEW_CATEGORIES = [
  { value: 'tenis', label: 'Tênis' },
  { value: 'camisetas', label: 'Camisetas' },
  { value: 'moletons', label: 'Moletons' },
  { value: 'calcas', label: 'Calças' },
  { value: 'bones', label: 'Bonés' },
  { value: 'oculos', label: 'Óculos' },
];

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
          <ProductOrganizationFields brands={PREVIEW_BRANDS} categories={PREVIEW_CATEGORIES} />
          <ProductPriceField />
          <ProductSummary />
        </>
      )}
    />
  );
}
