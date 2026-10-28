import { ratingShares } from '@/features/store/catalog/model/reviews';
import type { ReviewSummary } from '@/features/store/catalog/model/types';

type RatingDistributionProps = {
  summary: ReviewSummary;
};

export function RatingDistribution({ summary }: RatingDistributionProps) {
  return (
    <ul aria-label="Distribuição das notas" className="flex flex-col gap-1.5">
      {ratingShares(summary).map(({ stars, percent }) => (
        <li key={stars} className="flex items-center gap-3 text-caption text-gray-700">
          <span aria-hidden className="w-2 text-ink">{stars}</span>
          <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-pill bg-paper-stone">
            <span className="block h-full rounded-pill bg-ink" style={{ width: `${percent}%` }} />
          </span>
          <span className="w-9 text-right tabular-nums">
            <span className="sr-only">{`${stars} ${stars === 1 ? 'estrela' : 'estrelas'}: `}</span>
            {`${percent}%`}
          </span>
        </li>
      ))}
    </ul>
  );
}
