import type { ReactNode } from 'react';

import type { ProductDetail } from '@/features/store/catalog/model/types';
import { formatRating } from '@/lib/number';

import { FitScale } from './fit-scale';
import { RatingDistribution } from './rating-distribution';

type ReviewsSectionProps = {
  product: Pick<ProductDetail, 'rating' | 'reviewCount' | 'reviewSummary'>;
  list: ReactNode;
};

// O resumo usa os números do próprio produto: batem com a nota do topo e com o JSON-LD.
export function ReviewsSection({ product, list }: ReviewsSectionProps) {
  const { rating, reviewCount, reviewSummary } = product;

  return (
    <section aria-labelledby="reviews-title" className="rounded-block border border-paper-line bg-gray-0 p-5 sm:p-7 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-5 lg:col-span-4">
          <div>
            <p className="font-hand text-hand text-brand">A rua aprovou</p>
            <h2 id="reviews-title" className="type-display text-display-lg not-italic lg:text-display-xl">Avaliações</h2>
          </div>
          {rating === null || reviewCount === 0
            ? <p className="text-body text-gray-700">Este produto ainda não tem avaliações.</p>
            : (
                <>
                  <p className="flex items-baseline gap-2">
                    <span className="type-display text-display-2xl">{formatRating(rating)}</span>
                    <span className="text-body-sm text-gray-700">
                      {`de 5 · ${reviewCount} ${reviewCount === 1 ? 'avaliação' : 'avaliações'}`}
                    </span>
                  </p>
                  <RatingDistribution summary={reviewSummary} />
                  {reviewSummary.fit ? <FitScale fit={reviewSummary.fit} /> : null}
                </>
              )}
        </div>
        {reviewCount > 0 ? <div className="lg:col-span-8">{list}</div> : null}
      </div>
    </section>
  );
}
