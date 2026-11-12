import type { ReactNode } from 'react';

import type { ProductDetail, SelectOption } from '@/features/admin/products/model/types';
import type { VariantSummary } from '@/features/admin/products/model/variants';

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
  summary: VariantSummary;
  imageCount: number;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveBlockedReason?: string;
  formError?: string;
};

// Mesma tela para cadastrar e editar: sem `product`, é um cadastro novo. Os campos leem o formulário do container;
// mídia e variantes entram por slot, porque são contextos próprios.
export function ProductEditor({
  product,
  brands,
  categories,
  media,
  variants,
  summary,
  imageCount,
  hasUnsavedChanges,
  isSaving,
  saveBlockedReason,
  formError,
}: ProductEditorProps) {
  return (
    <ProductEditorView
      header={(
        <ProductEditorHeader
          caption={product ? 'Produtos · editar' : 'Produtos · novo cadastro'}
          title={product?.title ?? 'Novo produto'}
          status={product?.status ?? 'draft'}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          saveBlockedReason={saveBlockedReason}
        />
      )}
      main={(
        <>
          {formError ? <p role="alert" className="rounded-card bg-danger-50 px-5 py-3.5 text-body text-danger-700">{formError}</p> : null}
          <ProductInfoFields />
          {media}
          {variants}
        </>
      )}
      aside={(
        <>
          <ProductStatusField hint={product ? undefined : 'Será publicado na loja assim que você salvar.'} />
          <ProductOrganizationFields brands={brands} categories={categories} />
          <ProductPriceField />
          <ProductSummary summary={summary} imageCount={imageCount} />
        </>
      )}
    />
  );
}
