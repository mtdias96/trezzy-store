import type { ReactNode } from 'react';

import type { ProductDetail, SelectOption } from '@/features/admin/products/model/types';
import { summarizeVariants } from '@/features/admin/products/model/variants';

import { ProductEditorHeader } from './product-editor-header';
import { ProductEditorView } from './product-editor-view';
import { ProductInfoFields } from './product-info-fields';
import { ProductOrganizationFields } from './product-organization-fields';
import { ProductPriceField } from './product-price-field';
import { ProductStatusField } from './product-status-field';
import { ProductSummary } from './product-summary';

type ProductEditorProps = {
  product?: ProductDetail;
  brands: readonly SelectOption[];
  categories: readonly SelectOption[];
  media: ReactNode;
  variants: ReactNode;
};

// Mesma tela para cadastrar e editar: sem `product`, é um cadastro novo. Mídia e variantes entram por slot, porque
// são contextos próprios (a mídia, com o container de upload).
export function ProductEditor({ product, brands, categories, media, variants }: ProductEditorProps) {
  const summary = summarizeVariants(product?.variants ?? []);

  return (
    <ProductEditorView
      header={
        product
          ? <ProductEditorHeader caption="Produtos · editar" title={product.title} status={product.status} />
          : <ProductEditorHeader caption="Produtos · novo cadastro" title="Novo produto" status="draft" hasUnsavedChanges />
      }
      main={(
        <>
          <ProductInfoFields defaultTitle={product?.title} defaultDescription={product?.description} />
          {media}
          {variants}
        </>
      )}
      aside={(
        <>
          <ProductStatusField
            defaultActive={product ? product.status === 'active' : true}
            hint={product ? undefined : 'Será publicado na loja assim que você salvar.'}
          />
          <ProductOrganizationFields
            brands={brands}
            categories={categories}
            defaultBrandId={product?.brandId}
            defaultCategoryId={product?.categoryId}
          />
          <ProductPriceField defaultValue={summary.minPriceInCents ?? 0} />
          <ProductSummary summary={summary} imageCount={product?.media.length ?? 0} />
        </>
      )}
    />
  );
}
