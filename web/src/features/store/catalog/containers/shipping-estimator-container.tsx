'use client';

import { useActionState } from 'react';

import { ShippingEstimator, type ShippingQuote } from '@/components/store/forms/shipping-estimator';
import type { ActionResult, FormAction } from '@/lib/action-result';

type ShippingEstimatorContainerProps = {
  // Vem da página: o frete é outra feature.
  estimateShippingAction: FormAction<ShippingQuote[]>;
};

export function ShippingEstimatorContainer({ estimateShippingAction }: ShippingEstimatorContainerProps) {
  const [result, action, pending] = useActionState<ActionResult<ShippingQuote[]> | null, FormData>(
    estimateShippingAction,
    null,
  );

  return <ShippingEstimator action={action} pending={pending} result={result} />;
}
