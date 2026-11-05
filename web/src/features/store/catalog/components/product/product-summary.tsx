import { StarIcon } from 'lucide-react';

import type { ProductDetail } from '@/features/store/catalog/model/types';
import { discountPercent, formatPrice } from '@/lib/money';
import { formatRating } from '@/lib/number';

type ProductSummaryProps = {
  product: ProductDetail;
};

export function ProductSummary({ product }: ProductSummaryProps) {
  const { brand, name, rating, reviewCount, priceInCents, compareAtPriceInCents, installments, pixPriceInCents } = product;
  const wasPrice = compareAtPriceInCents !== null && compareAtPriceInCents > priceInCents ? compareAtPriceInCents : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-micro font-bold text-gray-700 uppercase">{brand}</p>
          {rating === null
            ? null
            : (
                <p className="flex items-center gap-1 text-body-sm font-semibold text-ink">
                  <StarIcon aria-hidden className="size-3.5 fill-current" />
                  <span className="sr-only">Nota </span>
                  {formatRating(rating)}
                  <span className="text-gray-700">
                    <span className="sr-only"> de 5,</span>
                    {` (${reviewCount} ${reviewCount === 1 ? 'avaliação' : 'avaliações'})`}
                  </span>
                </p>
              )}
        </div>
        <h1 className="mt-2 type-display text-display-md not-italic lg:text-display-lg">{name}</h1>
      </div>
      <div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-display-md font-extrabold text-ink">
            <span className="sr-only">Por </span>
            {formatPrice(priceInCents)}
          </span>
          {wasPrice === null
            ? null
            : (
                <>
                  <del className="text-body text-gray-600">
                    <span className="sr-only">De </span>
                    {formatPrice(wasPrice)}
                  </del>
                  <span className="rounded-pill bg-danger-600 px-2 py-0.5 text-micro font-extrabold text-gray-0">
                    {`-${discountPercent(wasPrice, priceInCents)}%`}
                  </span>
                </>
              )}
        </p>
        {installments
          ? (
              <p className="mt-1 text-body-sm text-gray-700">
                {`ou ${installments.count}x de ${formatPrice(installments.valueInCents)} sem juros no cartão`}
              </p>
            )
          : null}
      </div>
      {pixPriceInCents === null
        ? null
        : (
            <p className="flex items-center justify-between gap-3 rounded-2xl bg-success-50 px-4 py-3 text-success-700">
              <span>
                <span className="block text-body-lg font-extrabold">{`${formatPrice(pixPriceInCents)} no Pix`}</span>
                <span className="block text-caption">Pagamento à vista, aprovado na hora</span>
              </span>
              <span className="shrink-0 rounded-pill bg-success-700 px-2.5 py-1 text-micro font-extrabold text-gray-0">
                {`-${discountPercent(priceInCents, pixPriceInCents)}%`}
              </span>
            </p>
          )}
    </div>
  );
}
