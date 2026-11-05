import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import type { ShippingQuote } from '@/components/store/forms/shipping-estimator';
import { ProductDetailView } from '@/features/store/catalog/components/product/product-detail-view';
import { SizeChart } from '@/features/store/catalog/components/product/size-chart';
import { ReviewListSkeleton } from '@/features/store/catalog/components/reviews/review-list-skeleton';
import { ReviewsSection } from '@/features/store/catalog/components/reviews/reviews-section';
import { getProduct } from '@/features/store/catalog/data/queries';
import type { FormAction } from '@/lib/action-result';

import { PurchaseContainer } from './purchase-container';
import { ReviewListContainer } from './review-list-container';
import { ShippingEstimatorContainer } from './shipping-estimator-container';

type ProductDetailContainerProps = {
  slug: string;
  addToBagAction: FormAction;
  estimateShippingAction: FormAction<ShippingQuote[]>;
};

export async function ProductDetailContainer({ slug, addToBagAction, estimateShippingAction }: ProductDetailContainerProps) {
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const sizeChart = product.sizeChart ? <SizeChart chart={product.sizeChart} /> : null;

  return (
    <ProductDetailView
      product={product}
      sizeChart={sizeChart}
      purchase={<PurchaseContainer product={product} sizeChart={sizeChart} addToBagAction={addToBagAction} />}
      shipping={<ShippingEstimatorContainer estimateShippingAction={estimateShippingAction} />}
      reviews={(
        <ReviewsSection
          product={product}
          list={(
            <Suspense fallback={<ReviewListSkeleton />}>
              <ReviewListContainer slug={slug} />
            </Suspense>
          )}
        />
      )}
    />
  );
}
