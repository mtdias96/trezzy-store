import type { ProductReview } from '@/features/store/catalog/model/types';

import { ReviewCard } from './review-card';

type ReviewListProps = {
  reviews: readonly ProductReview[];
};

export function ReviewList({ reviews }: ReviewListProps) {
  return (
    <ul aria-label="Avaliações mais recentes" className="grid gap-3 md:grid-cols-3">
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard review={review} />
        </li>
      ))}
    </ul>
  );
}
