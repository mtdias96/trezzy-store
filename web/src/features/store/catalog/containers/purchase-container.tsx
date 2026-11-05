'use client';

import { type ReactNode, useActionState } from 'react';

import { PurchaseForm } from '@/features/store/catalog/components/product/purchase-form';
import type { ProductDetail } from '@/features/store/catalog/model/types';
import type { ActionResult, FormAction } from '@/lib/action-result';

type PurchaseContainerProps = {
  product: ProductDetail;
  sizeChart: ReactNode;
  // Vem da página: a sacola é outra feature.
  addToBagAction: FormAction;
};

export function PurchaseContainer({ product, sizeChart, addToBagAction }: PurchaseContainerProps) {
  const [result, action, pending] = useActionState<ActionResult | null, FormData>(addToBagAction, null);

  return <PurchaseForm product={product} sizeChart={sizeChart} action={action} pending={pending} result={result} />;
}
